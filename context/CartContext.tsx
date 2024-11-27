import React, { createContext, useReducer, useContext, useEffect, useState, useMemo } from 'react';
import { useCartDetails } from 'helpers/cartContext';
import { getRooms } from 'helpers/bnovo/getRooms';
import { axiosInstance } from 'helpers/axiosInstance';
import { IProduct, IStoreType } from 'types/order';
import { MenuV2ByIdResponse, NomenclatureResponse } from 'helpers/iiko/IikoApi/types';
import axios from 'axios';

// Типы
type CartItem = {
    id: string;
    quantity: number;
}

type Store = {
    id: string;
    order: CartItem[];
}

type CartState = {
    stores: { [key: string]: Store };
}

type StoreInfo = {
    id: string;
    customId: string
    isCustom: boolean
    title: string;
    category: string;
    imageUrl: string
    store_type: IStoreType
}

// type ProductInfo = {
//     id: string
//     storeId: string
//     name: string
//     warningText: string
//     imageUrl: string
//     price: number
// }

type CartAction =
    | { type: 'ADD_ITEM'; storeId: string; item: CartItem }
    | { type: 'REMOVE_ITEM'; storeId: string; itemId: string }
    | { type: 'UPDATE_QUANTITY'; storeId: string; itemId: string; quantity: number }
    | { type: 'CLEAR_CART'; storeId: string }
    | { type: 'LOAD_SAVED_CART'; payload: CartState }

// Начальное состояние
const defaultState: CartState = {
    stores: {}
}

// Контекст
const CartContext = createContext<{
    state: CartState;
    dispatch: React.Dispatch<CartAction>;
    storesInfo: { [key: string]: StoreInfo };
    productsInfo: { [key: string]: IProduct }
    hotelRooms: any,
    menuCache: { [key: string]: MenuV2ByIdResponse }
    iikoMenuIsFetched: boolean
    nomenclature: NomenclatureResponse
}>({
    state: defaultState, dispatch: () => null, storesInfo: {}, productsInfo: {},
    hotelRooms: null, menuCache: {}, iikoMenuIsFetched: false, nomenclature: null
});

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const { storeId, item } = action;
            const store = state.stores[storeId] || { id: storeId, order: [] };
            const existingItemIndex = store.order.findIndex(i => i.id === item.id);
            let updatedOrder = [...store.order];

            if (existingItemIndex >= 0) {
                updatedOrder[existingItemIndex] = {
                    ...updatedOrder[existingItemIndex],
                    quantity: updatedOrder[existingItemIndex].quantity + item.quantity,
                };
            } else {
                updatedOrder = [...updatedOrder, item];
            }

            return {
                ...state,
                stores: {
                    ...state.stores,
                    [storeId]: {
                        ...store,
                        order: updatedOrder,
                    },
                },
            };
        }
        case 'REMOVE_ITEM': {
            const { storeId, itemId } = action;
            const store = state.stores[storeId];
            if (!store) return state;
            const updatedOrder = store.order.filter(item => item.id !== itemId);

            return {
                ...state,
                stores: {
                    ...state.stores,
                    [storeId]: {
                        ...store,
                        order: updatedOrder,
                    },
                },
            };
        }
        case 'UPDATE_QUANTITY': {
            const { storeId, itemId, quantity } = action;
            const store = state.stores[storeId];
            if (!store) return state;
            const updatedOrder = store.order.map(item =>
                item.id === itemId ? { ...item, quantity } : item
            );

            return {
                ...state,
                stores: {
                    ...state.stores,
                    [storeId]: {
                        ...store,
                        order: updatedOrder,
                    },
                },
            };
        }

        case 'CLEAR_CART': {
            const { storeId } = action
            const { [storeId]: _, ...restStores } = state.stores

            return {
                ...state,
                stores: restStores,
            }
        }

        case 'LOAD_SAVED_CART': {
            return action.payload;
        }
        default:
            return state;
    }
}


export const CartProvider = ({ children }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [state, dispatch] = useReducer(cartReducer, defaultState)
    const { storesInfo, productsInfo, menuCache, iikoMenuIsFetched, nomenclature } = useCartDetails(state)
    const [hotelRooms, setHotelRooms] = useState(null)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // useEffect(() => {
    //     console.log('storesInfo ', storesInfo)
    //     // console.log('productsInfo ', productsInfo)
    // }, [storesInfo])





    useEffect(() => {
        if (isMounted) {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                dispatch({ type: 'LOAD_SAVED_CART', payload: JSON.parse(savedCart) });
            }
        }
    }, [isMounted]);

    useEffect(() => {
        if (isMounted) {
            localStorage.setItem('cart', JSON.stringify(state));
        }
    }, [state, isMounted])

    // useEffect(() => console.log('cart state: ', state), [state])
    // useEffect(() => console.log('HotelRooms: ', hotelRooms), [hotelRooms])

    useEffect(() => {
        const initRooms = async () => {
            const rooms = await axios.get('/api/rooms')
            const availableRooms = rooms.data
                .filter(x => x.tags !== '')
                .sort((a, b) => a.tags.localeCompare(b.tags))

            console.log('availableRooms: ', availableRooms)
            setHotelRooms(availableRooms)
        }
        initRooms()
    }, [])

    return (
        <CartContext.Provider value={{ state, dispatch, storesInfo, productsInfo, hotelRooms, menuCache, iikoMenuIsFetched, nomenclature }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart должен использоваться внутри CartProvider');
    }
    return context;
}
