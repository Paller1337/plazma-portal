import AdminWrapper from '@/components/admin/AdminWrapper'
import ServiceOrder from '@/components/admin/ServiceOrder'
import { useAdminOrders } from 'context/admin/OrderContext'
import { getRooms } from 'helpers/bnovo/getRooms'
import { withAdminAuthServerSideProps } from 'helpers/withAdminAuthServerSideProps'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next/types'
import { useEffect, useState } from 'react'
import { TOrderStatus } from 'types/order'


interface AdminOrdersPageProps {
    rooms?: any
}

// export interface IServiceOrderWithEntering extends IServiceOrder {
//     isEntering?: boolean
// }

export const getServerSideProps: GetServerSideProps = withAdminAuthServerSideProps(async (context) => {
    try {
        const rooms = await getRooms()

        if (!rooms) {
            throw new Error(`Комнат нет`)
        }
        return {
            props: {
                rooms: rooms,
            }
        };
    } catch (error) {
        console.error('Ошибка:', error);
        return { props: { orders: [], rooms: [] } };
    }
}, ['admin', 'moderator'])

interface PageNavItemProps {
    isActive?: boolean
    name: string
    count: number
    onClick?: () => void
}

type TNavItem = {
    status: TOrderStatus,
    name: string,
    count: number
}

const PageNavItem = (props: PageNavItemProps) => {

    return (
        <div className={`admin-page--pageNav__item ${props.isActive ? 'active' : ''}`}
            onClick={props.onClick}>

            {props.name}
            <div className='admin-page--pageNav__item-counter'>{props.count}</div>
        </div>
    )
}




export default function OrdersPage(props: AdminOrdersPageProps) {
    const [currentNav, setCurrentNav] = useState<TOrderStatus>('new')
    const hotelRooms = props.rooms?.filter(x => x.tags !== '')
    const { state, productsList } = useAdminOrders()
    const [orders, setOrders] = useState(state.orders)

    const router = useRouter()
    const query = router.query


    const navItems: TNavItem[] = [
        { status: 'new', name: 'Новые', count: state.orders.filter(x => x.status === 'new').length },
        { status: 'inwork', name: 'В работе', count: state.orders.filter(x => x.status === 'inwork').length },
        { status: 'delivered', name: 'Ожидают', count: state.orders.filter(x => x.status === 'delivered').length },
        { status: 'done', name: 'Завершенные', count: state.orders.filter(x => x.status === 'done').length }
    ]

    const loadOrders = (status: TOrderStatus) => {
        let tmporders
        switch (status) {
            case 'done':
                tmporders = state.orders.filter(x => x.status === 'done')
                setOrders(tmporders)
                break

            case 'delivered':
                tmporders = state.orders.filter(x => x.status === 'delivered')
                setOrders(tmporders)
                break;

            case 'inwork':
                tmporders = state.orders.filter(x => x.status === 'inwork')
                setOrders(tmporders)
                break;

            case 'new':
                tmporders = state.orders.filter(x => x.status === 'new')
                setOrders(tmporders)
                break
            default:
                tmporders = state.orders.filter(x => x.status === 'new')
                setOrders(tmporders)
                break
        }
    }

    const changeTab = (newStatus: TOrderStatus) => {
        setCurrentNav(newStatus)
        router.push(`/admin/services?status=${newStatus}`, undefined, { shallow: true });
    }

    useEffect(() => {
        setOrders(state.orders)
        loadOrders((query.status as string) as TOrderStatus)
    }, [state.orders, query.status])

    useEffect(() => {
        console.log('state.orders ', state.orders)
    }, [state.orders])


    return (
        <>
            <div className='admin--order'>
                <div className='admin-page--pageNav'>
                    {navItems.map(x =>
                        <PageNavItem
                            key={x.name}
                            count={x.count}
                            name={x.name}
                            isActive={currentNav === x.status}
                            onClick={() => changeTab(x.status)}
                        />
                    )}
                </div>

                <div className='admin-serviceCards'>
                    {orders.map((order, i) => {
                        // const serviceRoom = hotelRooms.find(x => x.id === service.orderInfo.customer.room)?.tags
                        // const orderClass = `service-order ${service.isEntering ? 'service-order-enter' : ''}`
                        // console.log('Заказ ', service.orderInfo.customer.name, 'Комната: ', serviceRoom)
                        return (
                            <div
                                // className={`${orderClass}`} 
                                key={'order-in-list-' + order.id}
                            >
                                <ServiceOrder
                                    order={order}
                                    products={productsList}
                                />
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
    )
}