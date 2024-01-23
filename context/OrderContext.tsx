import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { io } from 'socket.io-client'

const ORDER_TYPES = {
    SERVICE: 'service_orders',
    FOOD: 'food_orders',
    SUPPORT: 'support_tickets',
};

// Начальное состояние
const initialState = {
    [ORDER_TYPES.SERVICE]: [],
    [ORDER_TYPES.FOOD]: [],
    [ORDER_TYPES.SUPPORT]: [],
};

// Создаем контекст для заказов
const OrderContext = createContext(initialState);

// Редьюсер для обработки действий связанных с заказами
const orderReducer = (state, action) => {
    switch (action.type) {
        case 'ORDER_STATUS_CHANGE':
            // Обновить статус заказа в соответствующей категории
            return {
                ...state,
                [action.orderType]: state[action.orderType].map(order =>
                    order.id === action.payload.orderId ? { ...order, status: action.payload.newStatus } : order
                ),
            };
        // Добавьте другие case для обработки различных действий
        default:
            return state;
    }
};

// Провайдер контекста
export const OrderProvider = ({ children }) => {
    const [state, dispatch] = useReducer(orderReducer, initialState);

    // Подключение к WebSocket
    useEffect(() => {
        const socket = io('your_socket_endpoint');

        socket.on('serviceOrderStatusChange', data => {
            dispatch({ type: 'ORDER_STATUS_CHANGE', orderType: ORDER_TYPES.SERVICE, payload: data });
        });

        // Здесь можно добавить другие обработчики событий WebSocket для других типов заказов

        return () => {
            socket.off('serviceOrderStatusChange');
            // Отключить другие обработчики событий, если они будут добавлены
            socket.close();
        };
    }, []);

    return (
        <OrderContext.Provider value={{ state }}>
            {children}
        </OrderContext.Provider>
    );
};

// Хук для доступа к заказам и их изменению
export const useOrders = () => {
    const context = useContext(OrderContext);
    if (!context) throw new Error('useOrders must be used within an OrderProvider');
    return context;
};

// Использование в компоненте
// const { state: { service_orders }, dispatch } = useOrders();
// service_orders будет содержать заказы услуг
