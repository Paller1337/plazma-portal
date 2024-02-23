import { verifyToken } from 'helpers/login';
import React, { createContext, useContext, useState, ReactNode, useEffect, Dispatch, SetStateAction } from 'react'
import Cookies from 'js-cookie'
import { DEFAULTS } from 'defaults';
import { io } from 'socket.io-client';
import { checkOrderStatus } from 'helpers/order/order';
import toast from 'react-hot-toast';
import axios from 'axios';
import { axiosInstance } from 'helpers/axiosInstance';
import WelcomeScreen from '@/components/WelcomeScreen';
import { useRouter } from 'next/router';

interface AuthContextType {
    isAuthenticated: boolean
    isPwaBannerHidden: boolean
    setIsPwaBannerHidden: Dispatch<SetStateAction<boolean>>
    login: (surname: string, roomNumber: string) => Promise<{
        status: boolean;
        message: string;
    }>
    currentUser?: {
        id: number
        role: string
    }
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isPwaBannerHidden, setIsPwaBannerHidden] = useState(false)
    const [currentUser, setCurrentUser] = useState({ id: 0, role: '' })

    const [showWelcomeScreen, setShowWelcomeScreen] = useState(false)
    const [endWelcomeScreen, setEndWelcomeScreen] = useState(false)


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


    async function checkAuthToken() {
        const token = Cookies.get('session_token')

        if (!token) {
            setIsAuthenticated(false)
            return
        }
        const res = await axios.post('/api/token/decode', {
            token
        })
        if (res.status === 200) {
            const decodedToken = res.data
            if (decodedToken.isExpired) {
                Cookies.remove('session_token')
                setIsAuthenticated(false)
                return
            }

            if (decodedToken.role) {
                setCurrentUser({
                    id: decodedToken.accountId,
                    role: decodedToken.role
                })
                setIsAuthenticated(true)
            }
        }
    }


    useEffect(() => {
        checkAuthToken()
        // Проверка, находится ли пользователь на странице аутентификации
        const isAuthRoute = router.pathname.includes('auth')
        if (isAuthenticated && isAuthRoute) {
            setShowWelcomeScreen(true)

            // Создаём промис для отсчёта минимум 2 секунд
            const minTimePromise = new Promise(resolve => setTimeout(resolve, 2000))
            // Выполняем переход на главную страницу
            const routingPromise = router.push('/')

            Promise.all([minTimePromise, routingPromise]).then(() => {
                setEndWelcomeScreen(true)
                const endAnimationTimeout = setTimeout(() => {
                    setShowWelcomeScreen(false)
                    setEndWelcomeScreen(false)
                }, 1500)

                return () => clearTimeout(endAnimationTimeout)
            })
        }
    }, [isAuthenticated, router])


    return (
        <AuthContext.Provider value={{ isAuthenticated, isPwaBannerHidden, setIsPwaBannerHidden, login, currentUser }}>
            <WelcomeScreen show={showWelcomeScreen} end={endWelcomeScreen} />
            {children}
        </AuthContext.Provider>
    )
}
