import AdminWrapper from '@/components/admin/AdminWrapper'
import ServiceOrder from '@/components/admin/ServiceOrder'
import { Input, Loader, SegmentedControl } from '@mantine/core'
import { useAdminOrders } from 'context/admin/OrderContext'
import { getRooms } from 'helpers/bnovo/getRooms'
import { withAdminAuthServerSideProps } from 'helpers/withAdminAuthServerSideProps'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next/types'
import { useEffect, useState } from 'react'
import { IOrder, TOrderStatus } from 'types/order'
import { IconSearch } from '@tabler/icons-react'
import { DateTime } from 'luxon'


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
    status?: TOrderStatus,
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


const groupOrdersByDate = (orders: IOrder[]) => {
    return orders.reduce((groups, order) => {
        // Преобразуем дату создания заказа в объект DateTime и форматируем в строку 'yyyy-MM-dd'
        const date = DateTime.fromISO(order.create_at).toFormat('yyyy-MM-dd')
        if (!groups[date]) {
            groups[date] = []
        }
        groups[date].push(order)
        return groups
    }, {})
}

export default function OrdersPage(props: AdminOrdersPageProps) {
    const [currentNav, setCurrentNav] = useState<TOrderStatus>('new')
    const hotelRooms = props.rooms?.filter(x => x.tags !== '')
    const { state, productsList } = useAdminOrders()
    const [orders, setOrders] = useState(state.orders)
    const [orderFetchTime, setOrderFetchTime] = useState(null)

    const router = useRouter()
    const query = router.query

    const groupedOrders = groupOrdersByDate(orders)


    const navItems: TNavItem[] = [
        { status: 'null', name: 'Все', count: state.orders.length },
        { status: 'new', name: 'Новые', count: state.orders.filter(x => x.status === 'new').length },
        { status: 'inwork', name: 'В работе', count: state.orders.filter(x => x.status === 'inwork').length },
        { status: 'delivered', name: 'Ожидают', count: state.orders.filter(x => x.status === 'delivered').length },
        { status: 'done', name: 'Завершенные', count: state.orders.filter(x => x.status === 'done').length },
    ]

    const loadOrders = (status?: TOrderStatus) => {
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

            case 'null':
                tmporders = state.orders
                setOrders(tmporders)
                break

            default:
                tmporders = state.orders
                setOrders(tmporders)
                break
        }
    }

    const changeTab = (newStatus: TOrderStatus) => {
        setCurrentNav(newStatus)
        router.push(`/admin/portal/orders?status=${newStatus}`, undefined, { shallow: true });
    }

    useEffect(() => {
        setOrders(state.orders)
        loadOrders((query.status as string) as TOrderStatus)
    }, [state.orders, query.status])

    // useEffect(() => {
    //     console.log('state.orders ', state.orders)
    // }, [state.orders])

    const nowDate = DateTime.now()

    return (
        <>
            <div className='admin--order'>
                {/* <div className='admin-page--pageNav'>
                    {navItems.map(x =>
                        <PageNavItem
                            key={x.name}
                            count={x.count}
                            name={x.name}
                            isActive={currentNav === x.status}
                            onClick={() => changeTab(x.status)}
                        />
                    )}
                </div> */}
                <div className='admin--order__header'>
                    <div className='admin--order__header-content'>
                        <span className='admin--order__header-title'>Показаны заказы за сегодня</span>
                        <div className='admin--order__header-filters'>
                            <SegmentedControl
                                color="#262E4A"
                                data={navItems.map(x => ({ value: x.status, label: `${x.name} ${x.count}` }))}
                                radius={'md'}
                                size='md'
                                onChange={changeTab}
                            />
                            <Input
                                placeholder="Поиск..."
                                rightSection={<IconSearch size={16} />}
                                radius={'md'}
                                size='md'
                            />
                        </div>
                    </div>
                    <div className='admin-main__vs' />
                </div>
                {orders.length > 0 ?
                    <div className='admin--order__opd-wrapper'>
                        {/* {orders.map((order, i) => {
                        const dateTime = order.create_at
                        return (
                            <div key={i} className='admin--order__opd'>
                                <div className='admin--order__opd-header'>
                                    <div className='admin--order__opd-content'>
                                        <span className='admin--order__opd-title'>Заказы за сегодня</span>
                                    </div>
                                    <div className='admin-main__vs' />
                                </div>
                                <div className='admin-serviceCards'>
                                    {orders.map((order, i) => {
                                        return (
                                            <ServiceOrder
                                                key={'order-in-list-' + order.id}
                                                order={order}
                                                products={productsList}
                                            />
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })} */}
                        {Object.keys(groupedOrders).map((date, i) => (
                            <div key={i} className='admin--order__opd'>
                                <div className='admin--order__opd-header'>
                                    <div className='admin--order__opd-content'>
                                        <span className='admin--order__opd-title'>Заказы за
                                            <span className='date'>
                                                {nowDate.toSQLDate().toString() === date ? ' сегодня' :
                                                    nowDate.minus({ day: 1 }).toSQLDate().toString() === date ? ' вчера' :
                                                        ' ' + DateTime.fromSQL(date).toLocaleString(DateTime.DATE_HUGE)}
                                            </span>
                                        </span>
                                    </div>
                                    <div className='admin-main__vs' />
                                </div>
                                <div className='admin-serviceCards'>
                                    {groupedOrders[date].map((order: IOrder) => (
                                        <ServiceOrder
                                            key={'order-in-list-' + order.id}
                                            order={order}
                                            products={productsList}
                                            isVisualNew={order.isVisualNew}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                        {/* <div className='admin--order__opd'>
                        <div className='admin--order__opd-header'>
                            <div className='admin--order__opd-content'>
                                <span className='admin--order__opd-title'>Заказы за сегодня</span>
                            </div>
                            <div className='admin-main__vs' />
                        </div>
                        <div className='admin-serviceCards'>
                            {orders.map((order, i) => {
                                // const serviceRoom = hotelRooms.find(x => x.id === service.orderInfo.customer.room)?.tags
                                // const orderClass = `service-order ${service.isEntering ? 'service-order-enter' : ''}`
                                // console.log('Заказ ', service.orderInfo.customer.name, 'Комната: ', serviceRoom)
                                return (
                                    // <div
                                    // // className={`${orderClass}`} 
                                    // >
                                    <ServiceOrder
                                        key={'order-in-list-' + order.id}
                                        order={order}
                                        products={productsList}
                                    />
                                    // </div>
                                )
                            })}
                        </div>
                    </div> */}
                    </div>
                    :
                    <div className='admin--order__loader'><Loader size={48} color={'#485066'} /></div>
                }
            </div>
        </>
    )
}