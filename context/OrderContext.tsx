import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { checkOrderStatus } from 'helpers/order/order';
import toast from 'react-hot-toast';
import { DEFAULTS } from 'defaults';
import { ISupportTicket } from 'types/support'
import { TOrderStatus } from 'types/order';

interface IOrderProduct {
    id: string;
    quantity: number;
}

export interface IOrderContext {
    id: string
    order: IOrderProduct[]
    status: TOrderStatus
}

type ITicketContext = ISupportTicket
// {
//     id: string
//     status: string
//     create_at: string
//     close_at?: string
//     messages?: {
//         id: string
//         message: string
//         sender: string
//         sender_type: string
//     }[]
// }

// type OrderStateType = Record<string, IOrder>
// type TicketStateType = Record<string, ITicket>

interface GlobalStateType {
    orders: IOrderContext[]
    tickets: ITicketContext[]
}

const initialState: GlobalStateType = {
    orders: [],
    tickets: [],
};

const orderReducer = (state: GlobalStateType, action: any) => {
    switch (action.type) {
        case 'INITIALIZE_ORDERS':
            return {
                ...state,
                orders: action.payload.orders as IOrderContext[],
            };

        case 'UPDATE_ORDER_STATUS':
            const { orderId, status } = action.payload
            return {
                ...state,
                orders: state.orders.map(order =>
                    order.id === orderId
                        ? { ...order, status: status }
                        : order
                ),
            }


        case 'CREATE_ORDER':
            const newOrder = action.payload.order;
            return {
                ...state,
                orders: [
                    ...state.orders,
                    newOrder
                ] as IOrderContext[],
            }

        case 'INITIALIZE_TICKETS':
            return {
                ...state,
                tickets: action.payload.tickets as ITicketContext[],
            };

        default:
            return state;
    }
};

const OrderContext = createContext<{
    state: GlobalStateType
    dispatch: React.Dispatch<any>
    ordersIsLoading: boolean
    ticketsIsLoading: boolean
}>({ state: initialState, dispatch: () => null, ordersIsLoading: true, ticketsIsLoading: true });

export const OrderProvider = ({ children }) => {
    const [state, dispatch] = useReducer(orderReducer, initialState)
    const [ordersIsLoading, setOrdersIsLoading] = useState(true)
    const [ticketsIsLoading, setTicketsIsLoading] = useState(true)
    const { isAuthenticated, currentUser } = useAuth()

    useEffect(() => { console.log(state) }, [state])
    useEffect(() => {
        async function fetchOrdersAndTickets() {
            try {
                const ordersRes = await axios.post('/api/orders', {
                    data: {
                        id: currentUser.id,
                    }
                })
                // console.log('ordersRes ', ordersRes)
                const orders = ordersRes.data.orders.data?.map(ord => ({
                    id: ord.id,
                    status: ord.attributes?.status,
                    order: ord.attributes?.products?.map(product => ({
                        id: product.product.data.id,
                        quantity: product.quantity,
                    }))
                }) as IOrderContext)

                // console.log('orders ', orders)

                const ticketsRes = await axios.post('/api/tickets', {
                    data: {
                        id: currentUser.id,
                    }
                }).then(res => {
                    res.status == 200 && setTicketsIsLoading(false)
                    return res
                })

                // console.log('ticketsRes ', ticketsRes)
                const tickets = ticketsRes.data.tickets.data?.map(ticket => ({
                    id: ticket.id,
                    status: ticket.attributes?.status,
                    create_at: ticket.attributes?.create_at,
                    close_at: ticket.attributes?.close_at,
                    messages: ticket.attributes?.messages?.map(message => ({
                        id: message.id,
                        message: message.message,
                        sender: message.sender,
                        sender_type: message.sender_type,
                    }))
                }) as ITicketContext)

                if (ordersRes.status === 200) setOrdersIsLoading(false)
                // if (tickets.status === 200) setTicketsIsLoading(false)

                dispatch({
                    type: 'INITIALIZE_ORDERS',
                    payload: {
                        orders,
                    },
                });

                dispatch({
                    type: 'INITIALIZE_TICKETS',
                    payload: {
                        tickets,
                    },
                });
            } catch (error) {
                console.error('Ошибка при загрузке заказов и заявок: ', error);
            }
        }

        if (isAuthenticated) {
            fetchOrdersAndTickets();
        }
    }, [currentUser.id, isAuthenticated])

    useEffect(() => {
        if (isAuthenticated && currentUser.id !== 0) {
            const socket = io(DEFAULTS.SOCKET.URL, {
                query: {
                    userId: 'u_' + currentUser.id,
                    role: currentUser.role,
                },
            });

            socket.on('connect', () => {
                console.log('Connected to Strapi WebSocket')
            });

            socket.on('orderStatusChange', (data) => {
                const { newStatus, orderId } = data
                console.log('status change data ', data)
                console.log('orderId ', orderId)
                console.log('state.orders ', state.orders)
                console.log('status old data ', state.orders.find(x => x.id == orderId))
                dispatch({
                    type: 'UPDATE_ORDER_STATUS',
                    payload: { orderId, status: newStatus, previous_status: state.orders.find(x => x.id == orderId)?.status },
                })

                const textStatus = checkOrderStatus(newStatus);
                toast.success(<span>Новый статус заказа ({textStatus})</span>);
            });

            socket.on('orderCreate', (data) => {
                const newOrder = data.newOrder;
                dispatch({
                    type: 'CREATE_ORDER',
                    payload: { order: newOrder },
                });

                toast.success(<span>Новый заказ услуг</span>);
            });

            socket.on('connect_error', (error) => {
                console.error('Connection error:', error);
            });

            return () => {
                socket.off('connect');
                socket.off('orderStatusChange');
                socket.off('orderCreate');
                socket.disconnect();
            };
        }
    }, [isAuthenticated, currentUser, state.orders]);

    return (
        <OrderContext.Provider value={{ state, dispatch, ordersIsLoading, ticketsIsLoading }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrders = () => {
    const context = useContext(OrderContext);
    if (!context) throw new Error('useOrders must be used within an OrderProvider');
    return context;
};
