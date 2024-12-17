import React, { createContext, useContext, useReducer, useEffect, useState, useRef } from 'react'
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { checkOrderStatus } from 'helpers/order/order';
import toast from 'react-hot-toast';
import { DEFAULTS } from 'defaults';
import { ISupportTicket } from 'types/support'
import { TOrderStatus } from 'types/order';
import { ticketStatus } from 'helpers/support/tickets';
import { notify } from 'utils/notify';
import { FaCheckCircle } from "react-icons/fa"
import { MdUpdate } from "react-icons/md"
import { usePortal } from './PortalContext';


interface IOrderProduct {
    id: string;
    quantity: number;
}

export interface IOrderContext {
    id: string
    order: IOrderProduct[]
    status: TOrderStatus
    paid_for: boolean
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
    let orderId, status, paid_for
    switch (action.type) {
        case 'INITIALIZE_ORDERS':
            return {
                ...state,
                orders: action.payload.orders as IOrderContext[],
            };

        case 'UPDATE_ORDER_STATUS':
            orderId = action.payload.orderId
            status = action.payload.status
            return {
                ...state,
                orders: state.orders.map(order =>
                    order.id === orderId
                        ? { ...order, status: status }
                        : order
                ),
            }

        case 'UPDATE_ORDER_PAID_STATUS':
            orderId = action.payload.orderId
            paid_for = action.payload.paid_for
            return {
                ...state,
                orders: state.orders.map(order =>
                    order.id === orderId
                        ? { ...order, paid_for: paid_for }
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

        case 'UPDATE_TICKET_STATUS':
            return {
                ...state,
                tickets: state.tickets.map(ticket =>
                    ticket.id === action.payload.ticketId
                        ? { ...ticket, status: action.payload.status }
                        : ticket
                ),
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
    ws: React.MutableRefObject<Socket>
}>({
    state: initialState,
    dispatch: () => null,
    ordersIsLoading: true,
    ticketsIsLoading: true,
    ws: null
});

export const OrderProvider = ({ children }) => {
    const ws = useRef<Socket>(null)
    const { portalSettings } = usePortal()
    const [state, dispatch] = useReducer(orderReducer, initialState)
    const [ordersIsLoading, setOrdersIsLoading] = useState(true)
    const [ticketsIsLoading, setTicketsIsLoading] = useState(true)
    const [isInitFetched, setIsInitFetched] = useState(false)
    const { isAuthenticated, isAuthProcessed, currentUser, visitorId } = useAuth()

    useEffect(() => { if (portalSettings?.debug) console.log(state) }, [state, portalSettings])
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
                    })),
                    paid_for: ord.attributes?.paid_for,
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
            fetchOrdersAndTickets().then(() => setIsInitFetched(true))
        }
    }, [currentUser.id, isAuthenticated])
    useEffect(() => { if (portalSettings?.debug) console.log({ ws: ws.current }) }, [ws.current, portalSettings])

    useEffect(() => {
        if (visitorId && !ws.current && !isAuthProcessed) {
            // console.log('Socket Init');
            ws.current = io(DEFAULTS.SOCKET.URL, {
                query: {
                    visitorId: visitorId,
                    userId: currentUser.id !== 0 ? 'user_' + currentUser.id : null,
                    role: currentUser.id !== 0 ? currentUser.role : null,
                },
            });
        }

        return () => {
            if (ws.current) {
                ws.current.disconnect();
            }
        };
    }, [visitorId, isAuthProcessed]);

    useEffect(() => {
        if (visitorId && ws.current) {
            const socket = ws.current
            // console.log('Socket Start Connection')
            socket.on('connect', () => {
                console.log('Connected to Plazma WebSocket')
            });

            socket.on('disconnect', (e) => {
                console.log('disconnected to Plazma WebSocket', { e })
            });


            // socket.on('checkSocket', (data) => {
            //     console.log('checkSocket ', data)
            // });

            if (isAuthenticated && currentUser.id !== 0 && isInitFetched) {
                socket.on('orderStatusChange', (data) => {
                    const { newStatus, orderId, paid_for } = data
                    if (portalSettings?.debug) {
                        console.log('[TRIGGER] orderStatusChange', data)
                        console.log('orderId ', orderId)
                        console.log('state.orders ', state.orders)
                    }
                    // console.log('status old data ', state.orders.find(x => x.id == orderId)
                    const order = state.orders.find(x => x.id == orderId)
                    const textStatus = checkOrderStatus(newStatus);

                    if (portalSettings?.debug) console.log({ status: order?.status, incomeStatus: newStatus })
                    if (order?.status !== newStatus) {
                        dispatch({
                            type: 'UPDATE_ORDER_STATUS',
                            payload: { orderId, status: newStatus, previous_status: order?.status },
                        })

                        notify({
                            icon: <MdUpdate />,
                            title: 'Новый статус заказа',
                            message: textStatus,
                        })
                    }
                });

                socket.on('orderPaidStatusChange', (data) => {
                    const { paid_for, orderId } = data

                    if (portalSettings?.debug) {
                        console.log('[TRIGGER] orderPaidStatusChange', data)
                        console.log('orderId ', orderId)
                        console.log('paid_for ', paid_for)
                    }
                    dispatch({
                        type: 'UPDATE_ORDER_PAID_STATUS',
                        payload: { orderId, paid_for },
                    })
                    const order = state.orders.find(x => x.id == orderId)
                    if (order?.paid_for !== paid_for) {
                        if (paid_for) {
                            notify({
                                icon: <MdUpdate />,
                                title: 'Спасибо за покупку',
                                message: `Поступила оплата за заказ #${orderId}`,
                            })
                        }
                    }
                });



                socket.on('orderCreate', (data) => {
                    const newOrder = data.newOrder;
                    dispatch({
                        type: 'CREATE_ORDER',
                        payload: { order: newOrder },
                    });

                    notify({
                        icon: <FaCheckCircle />,
                        title: 'Новый заказ',
                        message: 'Ваш заказ принят',
                    })
                });

                socket.on('supportTicketStatusChange', (data) => {
                    const { newStatus, ticketId } = data
                    if (portalSettings?.debug) console.log('ticket data: ', data)
                    dispatch({
                        type: 'UPDATE_TICKET_STATUS',
                        payload: { ticketId, status: newStatus },
                    })

                    notify({
                        icon: <MdUpdate />,
                        title: 'Новый статус заявки',
                        message: ticketStatus(newStatus),
                    })
                });
            }
            socket.on('connect_error', (error) => {
                console.error('Connection error:', error);
            });

            return () => {
                socket.off('connect');
                socket.off('connect_error');
                socket.off('orderStatusChange');
                socket.off('orderPaidStatusChange');
                socket.off('orderCreate');
                socket.off('supportTicketStatusChange');
            };
        }
    }, [isAuthenticated, visitorId, isInitFetched]);

    useEffect(() => {
        if (ws.current && portalSettings?.debug) {
            console.log('Socket already initialized:', ws.current.id);
        } else {
            console.log('Initializing new socket connection');
        }
    }, [portalSettings])

    return (
        <OrderContext.Provider value={{ state, dispatch, ordersIsLoading, ticketsIsLoading, ws }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrders = () => {
    const context = useContext(OrderContext);
    if (!context) throw new Error('useOrders must be used within an OrderProvider');
    return context;
};
