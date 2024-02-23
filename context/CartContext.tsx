import React, { createContext, useReducer, useContext, useEffect, useState } from 'react'

type CartItem = {
    id: string
    title: string
    price: number
    quantity: number
    imageUrl: string
}

type CartState = {
    services: {
        items: CartItem[]
        total: number
    }
    food: {
        items: CartItem[]
        total: number
    }
}

type CartAction =
    | { type: 'ADD_ITEM'; category: 'services' | 'food'; item: CartItem }
    | { type: 'REMOVE_ITEM'; category: 'services' | 'food'; id: string }
    | { type: 'UPDATE_QUANTITY'; category: 'services' | 'food'; id: string; quantity: number }
    | { type: 'CLEAR_CART'; category: 'services' | 'food' }
    | { type: 'LOAD_SAVED_CART'; payload: CartState }


const defaultState: CartState = {
    services: { items: [], total: 0 },
    food: { items: [], total: 0 }
}

const CartContext = createContext<{
    state: CartState;
    dispatch: React.Dispatch<CartAction>;
}>({ state: defaultState, dispatch: () => null })

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const { category, item } = action;
            const existingItemIndex = state[category].items.findIndex(i => i.id === item.id);

            let updatedItems = [...state[category].items];
            if (existingItemIndex >= 0) {
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + 1,
                };
            } else {
                updatedItems = [...updatedItems, { ...item, quantity: item.quantity }];
            }

            return {
                ...state,
                [category]: {
                    ...state[category],
                    items: updatedItems,
                    total: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
                }
            };
        }
        case 'REMOVE_ITEM': {
            const updatedItems = state[action.category].items.filter(item => item.id !== action.id);
            const newTotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

            return {
                ...state,
                [action.category]: {
                    ...state[action.category],
                    items: updatedItems,
                    total: newTotal
                }
            };
        }

        case 'UPDATE_QUANTITY': {
            const updatedItems = state[action.category].items.map(item =>
                item.id === action.id ? { ...item, quantity: action.quantity } : item
            );
            const newTotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

            return {
                ...state,
                [action.category]: {
                    ...state[action.category],
                    items: updatedItems,
                    total: newTotal
                }
            };
        }

        case 'CLEAR_CART':
            // Очистка корзины
            return {
                ...state,
                [action.category]: {
                    items: [],
                    total: 0
                }
            }

        case 'LOAD_SAVED_CART':
            // Загрузка сохраненного состояния корзины
            return action.payload
            
        // ... другие действия
        default:
            return state;
    }
}



export const CartProvider = ({ children }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [state, dispatch] = useReducer(cartReducer, defaultState)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Загрузка состояния из localStorage при монтировании компонента
    useEffect(() => {
        if (isMounted) {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                dispatch({ type: 'LOAD_SAVED_CART', payload: JSON.parse(savedCart) });
            }
        }
    }, [isMounted])

    // Сохранение состояния в localStorage при его изменении
    useEffect(() => {
        if (isMounted) {
            localStorage.setItem('cart', JSON.stringify(state))
        }
    }, [state, isMounted])

    return (
        <CartContext.Provider value={{ state, dispatch }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart должен использоваться внутри CartProvider')
    }

    return context
}