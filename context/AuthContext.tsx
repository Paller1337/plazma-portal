import { verifyToken } from 'helpers/login';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import Cookies from 'js-cookie'
import { DEFAULTS } from 'defaults';
import { io } from 'socket.io-client';
import { checkOrderStatus } from 'helpers/order/order';
import toast from 'react-hot-toast';
import axios from 'axios';
import { axiosInstance } from 'helpers/axiosInstance';

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

    const login = async (surname: string, roomNumber: string) => {
        const auth = await axios.post('/api/login', {
            data: {
                surname,
                roomNumber
            }
        })

        if (auth.data.data.status == true) {
            setIsAuthenticated(true)
            Cookies.set('session_token', auth.data.sessionToken)
            // console.log('auth.data.sessionToken: ', auth.data.sessionToken)
            toast.success(auth.data.data.message)
            return auth.data.data
        } else {
            setIsAuthenticated(false)
            toast.error(auth.data.data.message)
            return auth.data.data
        }
    }

    useEffect(() => {
        async function initSocketAfterAuth() {
            const token = Cookies.get('session_token')

            if (!token) return
            const res = await axios.post('/api/token/decode', {
                token
            })
            if (res.status === 200) {
                console.log('decode res: ', res)
                const decodedToken = res.data
                if (decodedToken.isExpired) {
                    Cookies.remove('session_token')
                    setIsAuthenticated(false)
                    return
                }
                setIsAuthenticated(true)
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
                }
            }
        }

        initSocketAfterAuth()
    }, [])

    // useEffect(() => {
    //     console.log('isAuthenticated: ', isAuthenticated)
    // }, [isAuthenticated])


    return (
        <AuthContext.Provider value={{ isAuthenticated, login }}>
            {children}
        </AuthContext.Provider>
    )
}
