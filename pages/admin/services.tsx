import ServiceOrder from '@/components/admin/ServiceOrder'
import { Flex } from '@mantine/core'
import { getRooms } from 'helpers/bnovo/getRooms'
import { GetServerSideProps } from 'next'
import { useEffect, useState } from 'react'
import { IServiceOrder, TOrderStatus } from 'types/order'
import { useAdminOrders } from 'context/admin/OrderContext'
import { useRouter } from 'next/router'
import { withAdminAuthServerSideProps } from 'helpers/withAdminAuthServerSideProps'
import AdminOrderModal from '@/components/admin/OrderModal'

interface AdminServicesPageProps {
    rooms?: any
}

export interface IServiceOrderWithEntering extends IServiceOrder {
    isEntering?: boolean
}

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
})

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

export default function AdminServicesPage(props: AdminServicesPageProps) {
    const [currentNav, setCurrentNav] = useState<TOrderStatus>('new')
    const hotelRooms = props.rooms?.filter(x => x.tags !== '')
    const { state } = useAdminOrders()
    const [orders, setOrders] = useState<IServiceOrderWithEntering[]>(state.service_orders)

    const router = useRouter()
    const query = router.query


    const navItems: TNavItem[] = [
        { status: 'new', name: 'Новые', count: state.service_orders.filter(x => x.orderInfo.status === 'new').length },
        { status: 'inwork', name: 'В работе', count: state.service_orders.filter(x => x.orderInfo.status === 'inwork').length },
        { status: 'delivered', name: 'Ожидают', count: state.service_orders.filter(x => x.orderInfo.status === 'delivered').length },
        { status: 'done', name: 'Завершенные', count: state.service_orders.filter(x => x.orderInfo.status === 'done').length }
    ]

    const loadOrders = (status: TOrderStatus) => {
        let tmporders
        switch (status) {
            case 'done':
                tmporders = state.service_orders.filter(x => x.orderInfo.status === 'done')
                setOrders(tmporders)
                break

            case 'delivered':
                tmporders = state.service_orders.filter(x => x.orderInfo.status === 'delivered')
                setOrders(tmporders)
                break;

            case 'inwork':
                tmporders = state.service_orders.filter(x => x.orderInfo.status === 'inwork')
                setOrders(tmporders)
                break;

            case 'new':
                tmporders = state.service_orders.filter(x => x.orderInfo.status === 'new')
                setOrders(tmporders)
                break
            default:
                tmporders = state.service_orders.filter(x => x.orderInfo.status === 'new')
                setOrders(tmporders)
                break
        }
    }

    const changeTab = (newStatus: TOrderStatus) => {
        setCurrentNav(newStatus)
        router.push(`/admin/services?status=${newStatus}`, undefined, { shallow: true });
    }

    useEffect(() => {
        setOrders(state.service_orders)
        loadOrders((query.status as string) as TOrderStatus)
    }, [state.service_orders, query.status])


  
    // useEffect(() => {
    //     socket.on('connect', () => {
    //         console.log('Connected to Strapi WebSocket');
    //     })

    //     socket.on('orderCreate', (data) => {
    //         console.log('Received new order', data.newOrder);

    //         const newOrderData = data.newOrder; // предположим, что данные заказа находятся в свойстве newStatus
    //         const normalizedOrder = normalizeServiceOrderData(newOrderData)

    //         console.log('new normalizedOrder', normalizedOrder)
    //         setOrders(prevOrders => [normalizedOrder, ...prevOrders]);

    //         setTimeout(() => {
    //             setOrders(prevOrders => prevOrders.map(order => {
    //                 if (order.id === normalizedOrder.id) {
    //                     const { isEntering, ...rest } = order;
    //                     return { ...rest };
    //                 }
    //                 return order;
    //             }));
    //         }, 300);
    //     });

    //     socket.on('orderStatusChange', (data) => {
    //         console.log(data)
    //         const orderId = data.orderId;
    //         const newStatus = data.newStatus;
    //         const roomId = data.roomId

    //         // Обновление статуса конкретного заказа в состоянии
    //         setOrders(prevOrders => prevOrders.map(order => {
    //             if (order.id === orderId) {
    //                 return { ...order, orderInfo: { ...order.orderInfo, status: newStatus } }; // Обновляем статус заказа
    //             }
    //             return order;
    //         }));

    //         // Отображение уведомления о смене статуса
    //         const serviceRoom = hotelRooms.find(x => x.id === roomId)?.tags;
    //         console.log('Event: ', data.event);
    //         console.log('Новый статус заказа для "', serviceRoom, '" - ', newStatus);
    //         toast.success(
    //             <span>
    //                 Новый статус заказа ({checkOrderStatus(newStatus)}) для <br /><strong>{serviceRoom}</strong>
    //             </span>
    //         );
    //     })

    //     socket.on('connect_error', (error) => {
    //         console.error('Connection error:', error);
    //     })

    //     return () => {
    //         socket.off('connect')
    //         socket.off('orderStatusChange')
    //         socket.off('orderCreate')
    //         socket.disconnect()
    //     };
    // }, [hotelRooms, socket])

    // useEffect(() => {
    //     console.log("Заказы: \n", state.service_orders)
    // }, [state])
    return (
        <>
            <main className='admin-page'>
                <Flex
                    direction={'column'}
                    gap={12}
                >
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
                        {orders.map((service, i) => {
                            const serviceRoom = hotelRooms.find(x => x.id === service.orderInfo.customer.room)?.tags
                            const orderClass = `service-order ${service.isEntering ? 'service-order-enter' : ''}`
                            // console.log('Заказ ', service.orderInfo.customer.name, 'Комната: ', serviceRoom)
                            return (
                                <div className={`${orderClass}`} key={service.id}>
                                    <ServiceOrder
                                        key={`srv-${service.id}`}
                                        id={service.id}
                                        orderInfo={service.orderInfo}
                                        order={service.order}
                                        roomName={serviceRoom}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </Flex>
            </main>
        </>
    )
}