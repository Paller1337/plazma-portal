import ServiceOrder from '@/components/admin/ServiceOrder';
import { Flex, Stack } from '@mantine/core';
import { getRooms } from 'helpers/bnovo/getRooms';
import { getServiceOrders, normalizeServiceOrderData } from 'helpers/order/services';
import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import { IService, IServiceOrderData, IServiceOrdered, TServiceOrderStatus } from 'types/services';

import io from 'socket.io-client'
import toast from 'react-hot-toast';
import { DEFAULTS } from 'defaults';
import { checkOrderStatus } from 'helpers/order/order';
import { IOrderInfo, IServiceOrder } from 'types/order';



interface AdminServicesPageProps {
    orders?: IServiceOrder[]
    rooms?: any
}

export interface IServiceOrderWithEntering extends IServiceOrder {
    isEntering?: boolean;
}


export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        const res = await getServiceOrders();
        const rooms = await getRooms();

        if (!res) {
            throw new Error(`Заказов нет`);
        }

        if (!rooms) {
            throw new Error(`Комнат нет`);
        }

        const orders: IServiceOrder[] = res.map(x => {
            const guestAccountData = x.attributes.orderInfo.customer.guest_account.data;
            console.log('guestAccountData ', guestAccountData)
            const orderInfo: IOrderInfo = {
                status: x.attributes.orderInfo.status,
                createAt: x.attributes.createdAt,
                completedAt: x.attributes.orderInfo.completed_at,
                description: x.attributes.orderInfo.description,
                customer: {
                    name: x.attributes.orderInfo.customer.name,
                    room: x.attributes.orderInfo.customer.room,
                    phone: x.attributes.orderInfo.customer.phone,
                    guest_account: {
                        id: guestAccountData.id,
                        ...guestAccountData.attributes
                    }
                },
                paymentType: x.attributes.orderInfo.paymentType
            };

            const orderData = x.attributes.order.map(item => {

                // console.log('service.item: ', item)
                return {
                    service: item.service.data,
                    quantity: item.quantity,
                } as IServiceOrdered
            })

            return {
                id: x.id,
                orderInfo,
                order: orderData
            } as IServiceOrder
        });

        return {
            props: {
                orders: orders,
                rooms: rooms,
            }
        };
    } catch (error) {
        console.error('Ошибка:', error);
        return { props: { orders: [], rooms: [] } };
    }
}
interface PageNavItemProps {
    isActive?: boolean
    name: string
    count: number
    onClick?: () => void
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
    const [currentNav, setCurrentNav] = useState(1)
    const hotelRooms = props.rooms?.filter(x => x.tags !== '')
    const [orders, setOrders] = useState<IServiceOrderWithEntering[]>(props.orders)

    const navItems = [
        { id: 1, name: 'Новые', count: 6 },
        { id: 2, name: 'Завершенные', count: 2 },
        { id: 3, name: 'Ожидают', count: 17 }
    ]

    const socket = io(DEFAULTS.SOCKET.URL, {
        query: {
            userId: 100200101,
            role: 'admin',
        }
    })

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to Strapi WebSocket');
        })

        socket.on('orderCreate', (data) => {
            console.log('Received new order', data.newOrder);

            const newOrderData = data.newOrder; // предположим, что данные заказа находятся в свойстве newStatus
            const normalizedOrder = normalizeServiceOrderData(newOrderData)

            console.log('new normalizedOrder', normalizedOrder)
            setOrders(prevOrders => [normalizedOrder, ...prevOrders]);

            setTimeout(() => {
                setOrders(prevOrders => prevOrders.map(order => {
                    if (order.id === normalizedOrder.id) {
                        const { isEntering, ...rest } = order;
                        return { ...rest };
                    }
                    return order;
                }));
            }, 300);
        });

        socket.on('orderStatusChange', (data) => {
            console.log(data)
            const orderId = data.orderId;
            const newStatus = data.newStatus;
            const roomId = data.roomId

            // Обновление статуса конкретного заказа в состоянии
            setOrders(prevOrders => prevOrders.map(order => {
                if (order.id === orderId) {
                    return { ...order, orderInfo: { ...order.orderInfo, status: newStatus } }; // Обновляем статус заказа
                }
                return order;
            }));

            // Отображение уведомления о смене статуса
            const serviceRoom = hotelRooms.find(x => x.id === roomId)?.tags;
            console.log('Event: ', data.event);
            console.log('Новый статус заказа для "', serviceRoom, '" - ', newStatus);
            toast.success(
                <span>
                    Новый статус заказа ({checkOrderStatus(newStatus)}) для <br /><strong>{serviceRoom}</strong>
                </span>
            );
        })

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        })

        return () => {
            socket.off('connect')
            socket.off('orderStatusChange')
            socket.off('orderCreate')
            socket.disconnect()
        };
    }, [])

    useEffect(() => {
        console.log("Заказы: \n", orders)
    }, [orders])
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
                                isActive={currentNav === x.id}
                                onClick={() => setCurrentNav(x.id)}
                            />
                        )}
                    </div>

                    <div className='admin-serviceCards'>
                        {orders.map((service, i) => {
                            const serviceRoom = hotelRooms.find(x => x.id === service.orderInfo.customer.room)?.tags
                            const orderClass = `service-order ${service.isEntering ? 'service-order-enter' : ''}`
                            // console.log('Заказ ', service.orderInfo.customer.name, 'Комната: ', serviceRoom)
                            return (
                                <div className={`service-order ${orderClass}`} key={service.id}>
                                    <ServiceOrder
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
    );
}