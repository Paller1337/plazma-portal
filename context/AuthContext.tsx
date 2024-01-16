import authenticationPortal, { decodeToken, verifyToken } from 'helpers/login';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import Cookies from 'cookies'
import { DEFAULTS } from 'defaults';
import { io } from 'socket.io-client';
import { checkOrderStatus } from 'helpers/order/order';
import toast from 'react-hot-toast';

interface AuthContextType {
    isAuthenticated: boolean
    login: (surname: string, roomNumber: string) => Promise<{
        status: boolean;
        message: string;
    }>
    currentUser?: {

    }
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const isAuth = verifyToken()
        if (isAuth) setIsAuthenticated(true)
    }, [])

    const login = async (surname: string, roomNumber: string) => {
        const auth = await authenticationPortal(surname, roomNumber)
        if (auth.status) {
            setIsAuthenticated(true)
            return auth
        } else {
            setIsAuthenticated(false)
            return auth
        }
    };

    useEffect(() => {
        const decodedToken = decodeToken()
        console.log('USER INFO: ', decodedToken)
        if (decodedToken.role) {
            const socket = io(DEFAULTS.SOCKET.URL, {
                query: {
                    userId: decodedToken.accountId,
                    role: decodedToken.role,
                }
            })
            // if (isAuthenticated) {
            socket.on('connect', () => {
                console.log('Connected to Strapi WebSocket');
            })

            socket.on('orderStatusChange', (data) => {
                console.log('change status')
                const newStatus = data.newStatus;
                const textStatus = checkOrderStatus(newStatus)
                toast.success(
                    <span>
                        Новый статус заказа ({textStatus})
                    </span>
                );
            });
            console.log('Socket: ', socket)

            socket.on('connect_error', (error) => {
                console.error('Connection error:', error);
            })

            return () => {
                socket.off('connect');
                socket.off('orderStatusChange'); // Удалите слушателя для orderStatusChange
            };
            // }
        }
    }, [])



    return (
        <AuthContext.Provider value={{ isAuthenticated, login }}>
            {children}
        </AuthContext.Provider>
    )
}
