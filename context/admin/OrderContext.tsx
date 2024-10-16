import axios from 'axios'
import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import { DEFAULTS } from 'defaults'
import { ISupportTicket } from 'types/support'
import { checkOrderStatus } from 'helpers/order/order'
import { ticketStatus } from 'helpers/support/tickets'
import { axiosInstance } from 'helpers/axiosInstance'
import { IOrder, IProduct, IRoomInfo, IStore, IStoreType, TOrderStatus } from 'types/order'
import { IGuestAccount } from 'types/session'

interface IOrderProduct {
    id: string;
    quantity: number;
}

// interface IOrderContext {
//     id: string;
//     order: IOrderProduct[]
//     status: TOrderStatus
//     comment: string
//     description: string
//     create_at: string
//     guest: IGuestAccount
//     paymentType: string
//     phone: string
//     previous_status: TOrderStatus
//     room: IRoomInfo
//     store: IStore
//     type: IStoreType
// }

type ITicketContext = ISupportTicket;

interface GlobalStateType {
    orders: IOrder[];
    tickets: ITicketContext[];
}

const initialState: GlobalStateType = {
    orders: [],
    tickets: [],
};

const orderReducer = (state: GlobalStateType, action: any) => {
    // console.log('orderReducer', action)
    switch (action.type) {
        case 'INITIALIZE_ORDERS':
            return {
                ...state,
                orders: action.payload.orders,
            };

        case 'UPDATE_ORDER_STATUS':
            return {
                ...state,
                orders: state.orders.map(order =>
                    order.id === action.payload.orderId
                        ? { ...order, status: action.payload.status, previous_status: action.payload.previous_status }
                        : order
                ),
            };

        case 'CREATE_ORDER':
            return {
                ...state,
                orders: [{ ...action.payload.order, isVisualNew: true }, ...state.orders],
            };

        case 'INITIALIZE_TICKETS':
            return {
                ...state,
                tickets: action.payload.tickets,
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

        case 'CREATE_TICKET':
            return {
                ...state,
                tickets: [{ ...action.payload.ticket, isVisualNew: true }, ...state.tickets],
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
    productsList: IProduct[]
    clients?: {
        count: number
        list: any[]
    }
}>({ state: initialState, dispatch: () => null, ordersIsLoading: true, ticketsIsLoading: true, productsList: [] })

export const OrderProvider = ({ children }) => {
    const [state, dispatch] = useReducer(orderReducer, initialState)
    const { isAuthenticated, currentUser } = useAuth()
    const [ordersIsLoading, setOrdersIsLoading] = useState(true)
    const [ticketsIsLoading, setTicketsIsLoading] = useState(true)
    const socketRef = useRef(null)
    const [online, setOnline] = useState(0)
    const [clientsList, setClientsList] = useState([])

    const [productsList, setProductsList] = useState<IProduct[]>([])

    useEffect(() => {
        async function fetchProducts() {
            if (!isAuthenticated || !currentUser.id) return
            try {
                const productsRes = await axiosInstance.post(`/api/store/product/fetch`)

                // console.log('products: ', productsRes.data)
                const products = productsRes.data.data.map(product => ({
                    id: product.id,
                    description: product.attributes.description,
                    for_sale: product.attributes.for_sale,
                    image: product.attributes.image.data.attributes.url, //
                    memo_text: product.attributes.memo_text,
                    name: product.attributes.name,
                    price: product.attributes.price,
                    store: product.attributes.store.data.id,//
                    warning_text: product.attributes.warning_text,
                }) as IProduct)
                setProductsList(products)
                console.log('products: ', products)

            } catch (error) {
                console.error('Ошибка при загрузке продуктов: ', error);
            }
        }

        fetchProducts()
    }, [isAuthenticated, currentUser.id])

    useEffect(() => {
        async function fetchOrdersAndTickets() {
            if (!isAuthenticated || !currentUser.id) return

            try {
                const ordersRes = await axiosInstance.post(`/api/admin/order/fetch`)

                console.log(ordersRes.data)
                const orders = ordersRes.data.orders.data.map(ord => ({
                    id: ord.id,
                    status: ord?.attributes.status,
                    products: ord?.attributes.products.map(product => ({
                        id: product.product.data.id,
                        quantity: product.quantity,
                    })),
                    iikoProducts: ord?.attributes.iikoProducts?.map(product => ({
                        product: product?.product,
                        quantity: product?.quantity,
                        price: product?.price || -1,
                    })) || [],
                    comment: ord?.attributes.comment,
                    create_at: ord?.attributes.create_at,
                    description: ord?.attributes.description,
                    paymentType: ord?.attributes.paymentType,
                    phone: ord?.attributes.phone,
                    previous_status: ord?.attributes.previous_status,
                    room: ord?.attributes.room,
                    guest: {
                        id: ord?.attributes.guest.data.id,
                        name: ord?.attributes.guest.data?.attributes.name,
                        phone: ord?.attributes.guest.data?.attributes.phone,
                        email: ord?.attributes.guest.data?.attributes.email,
                        role: ord?.attributes.guest.data?.attributes.role,
                        mailing: ord?.attributes.guest.data?.attributes.mailing,
                        approved: ord?.attributes.guest.data?.attributes.approved,
                    },
                    store: {
                        id: ord?.attributes.store.data?.id,
                        description: ord?.attributes.store.data?.attributes.description,
                        isActive: ord?.attributes.store.data?.attributes.isActive,
                        preview_size: ord?.attributes.store.data?.attributes.preview_size,
                        title: ord?.attributes.store.data?.attributes.title,
                        short_desc: ord?.attributes.store.data?.attributes.short_desc,
                        tag: ord?.attributes.store.data?.attributes.tag,
                        image: ord?.attributes.store.data?.attributes.image.data?.attributes.url,
                        store_type: {
                            id: ord?.attributes.store.data?.attributes.store_type.data?.id,
                            label: ord?.attributes.store.data?.attributes.store_type.data?.attributes.label,
                            value: ord?.attributes.store.data?.attributes.store_type.data?.attributes.value
                        },
                        category: ord?.attributes.store.data?.attributes.category.data?.attributes.name,
                    },
                    isVisualNew: false,
                    completed_at: ord?.attributes.completed_at,
                    // type: {
                    //     id: ord?.attributes.type.data?.id,
                    //     label: ord?.attributes.type.data?.attributes.label,
                    //     value: ord?.attributes.type.data?.attributes.value,

                    // }
                }) as IOrder)

                console.log(orders)

                const ticketsRes = await axiosInstance.post(`/api/admin/ticket/fetch`, {
                    headers: {
                        Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
                    },
                })


                console.log(ticketsRes.data)
                const tickets = ticketsRes.data.tickets.data.map(ticket => ({
                    id: ticket.id,
                    status: ticket.attributes.status,
                    create_at: ticket.attributes.create_at,
                    close_at: ticket.attributes.close_at,
                    messages: ticket.attributes.messages.map(message => ({
                        id: message.id,
                        message: message.message,
                        sender: message.sender,
                        sender_type: message.sender_type,
                    })),
                    room: ticket?.attributes.room,
                    guest: {
                        id: ticket?.attributes.guest.data?.id,
                        name: ticket?.attributes.guest.data?.attributes.name,
                        phone: ticket?.attributes.guest.data?.attributes.phone,
                        email: ticket?.attributes.guest.data?.attributes.email,
                        role: ticket?.attributes.guest.data?.attributes.role,
                        mailing: ticket?.attributes.guest.data?.attributes.mailing,
                        approved: ticket?.attributes.guest.data?.attributes.approved,
                    },
                    isVisualNew: false,
                }) as ISupportTicket);

                dispatch({
                    type: 'INITIALIZE_ORDERS',
                    payload: { orders },
                });

                dispatch({
                    type: 'INITIALIZE_TICKETS',
                    payload: { tickets },
                });

                setOrdersIsLoading(false);
                setTicketsIsLoading(false);
            } catch (error) {
                console.error('Ошибка при загрузке заказов и заявок: ', error);
            }
        }

        if (isAuthenticated) {
            fetchOrdersAndTickets();
        }
    }, [isAuthenticated, currentUser.id]);


    useEffect(() => {
        if (isAuthenticated && currentUser.id) {
            if (!socketRef.current) {
                socketRef.current = io(DEFAULTS.SOCKET.URL, {
                    query: {
                        userId: 'a_' + currentUser.id,
                        role: currentUser.role,
                    }
                });

                const socket = socketRef.current;

                socket.on('connect', () => {
                    console.log('Connected admin to Strapi WebSocket');
                });

                socket.on('portalOnline', (data) => {
                    setOnline(data.online);
                    setClientsList(data.clients);
                });

                socket.on('orderStatusChange', (data) => {
                    const { newStatus, orderId } = data;
                    // dispatch({
                    //     type: 'UPDATE_ORDER_STATUS',
                    //     payload: { 
                    //         orderId, 
                    //         status: newStatus,
                    //         previous_status: response.data.newData.data.attributes.previous_status,
                    //     },
                    // })
                    toast.success(`Новый статус заказа (${checkOrderStatus(newStatus)})`)
                })

                socket.on('orderCreate', (data) => {
                    const newOrder = data.newOrder;
                    console.log('orderCreate event: ', data.event)
                    dispatch({
                        type: 'CREATE_ORDER',
                        payload: { order: newOrder },
                    });
                    toast.success('Новый заказ');
                });

                socket.on('supportTicketStatusChange', (data) => {
                    const { newStatus, ticketId } = data
                    console.log('ticket data: ', data)
                    dispatch({
                        type: 'UPDATE_TICKET_STATUS',
                        payload: { ticketId, status: newStatus },
                    });
                    toast.success(`Новый статус заявки (${ticketStatus(newStatus)})`)
                });

                socket.on('supportTicketCreate', (data) => {
                    const newTicket = data.newTicket;
                    console.log('Новая заявка на поддержку: ', newTicket)
                    console.log('Event: ', data.event)
                    dispatch({
                        type: 'CREATE_TICKET',
                        payload: { ticket: newTicket },
                    });
                    toast.success('Новая заявка на поддержку');
                });

                socket.on('connect_error', (error) => {
                    console.error('Connection error:', error);
                });

                return () => {
                    if (socketRef.current) {
                        socket.off('connect');
                        socket.off('orderStatusChange');
                        socket.off('orderCreate');
                        socket.off('supportTicketCreate');
                        socketRef.current.disconnect();
                        socketRef.current = null;
                    }
                };
            }
        }
    }, [isAuthenticated, currentUser])

    return (
        <OrderContext.Provider value={{
            state,
            dispatch,
            ordersIsLoading,
            ticketsIsLoading,
            productsList,
            clients: { count: online, list: clientsList }
        }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useAdminOrders = () => {
    const context = useContext(OrderContext);
    if (!context) throw new Error('useAdminOrders must be used within an OrderProvider');
    return context;
};
