import React, { createContext, useReducer, useContext } from 'react';


const defaultState = { items: [], total: 0 }
const CartContext = createContext<[typeof defaultState, React.Dispatch<any>]>([defaultState, () => { }])

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingItemIndex = state.items.findIndex(item => item.title === action.item.title);
            let newItems = [...state.items];
            let newTotal = state.total;

            if (existingItemIndex >= 0) {
                newItems[existingItemIndex] = {
                    ...newItems[existingItemIndex],
                    quantity: newItems[existingItemIndex].quantity + 1,
                };
            } else {
                newItems = [...state.items, { ...action.item, quantity: 1 }];
            }

            // Пересчитываем общую сумму
            newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

            return { ...state, items: newItems, total: newTotal };
        }
        case 'INCREASE_QUANTITY': {
            let newItems = state.items.map(item => {
                if (item.title === action.title) {
                    return { ...item, quantity: item.quantity + 1 };
                }
                return item;
            });

            // Пересчитываем общую сумму
            let newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

            return { ...state, items: newItems, total: newTotal };
        }
        case 'DECREASE_QUANTITY': {
            let newItems = state.items.map(item => {
                if (item.title === action.title && item.quantity > 1) {
                    return { ...item, quantity: item.quantity - 1 };
                }
                return item;
            });

            // Пересчитываем общую сумму
            let newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

            return { ...state, items: newItems, total: newTotal };
        }
        
        case 'REMOVE_ITEM':
            // Обработка действия удаления товара из корзины
            // Вернуть новое состояние
            return {
                ...state,
                items: state.items.filter(item => item.id !== action.id),
                total: state.total - state.items.find(item => item.id === action.id).price,
            };
        // ... другие действия
        default:
            // В случае неизвестного действия возвращать текущее состояние
            return state;
    }
};

export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, defaultState);

    return (
        <CartContext.Provider value={[state, dispatch]}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart должен использоваться внутри CartProvider');
    }

    const [state, dispatch] = context
    return { state, dispatch }
};