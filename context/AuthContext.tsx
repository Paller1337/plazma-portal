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
import AuthModal from '@/components/AuthModal';
import Button from '@/components/Button';

interface AuthContextType {
    isAuthenticated: boolean
    isPwaBannerHidden: boolean
    setIsPwaBannerHidden: Dispatch<SetStateAction<boolean>>
    login?: (surname: string, roomNumber: string) => Promise<{
        status: boolean;
        message: string;
    }>
    authGuestByPhone: (phone: string) => Promise<{
        status: boolean;
        message: string;
    }>
    registerGuest: (phone: string, name: string, email: string) => Promise<{
        status: boolean
        message: string
        data?: any
    }>
    currentUser?: {
        id: number
        phone: string
        name: string
        role: string
        approved: boolean
    }
    openAuthModal: () => void
    closeAuthModal: () => void
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isPwaBannerHidden, setIsPwaBannerHidden] = useState(false)
    const [currentUser, setCurrentUser] = useState({ id: 0, phone: '', name: '', role: '', approved: false })

    const [showWelcomeScreen, setShowWelcomeScreen] = useState(false)
    const [endWelcomeScreen, setEndWelcomeScreen] = useState(false)

    const [authModalIsOpen, setAuthModalIsOpen] = useState(false)
    const closeAuthModal = () => setAuthModalIsOpen(false)
    const openAuthModal = () => setAuthModalIsOpen(true)

    // const login = async (surname: string, roomNumber: string) => {
    //     const auth = await axios.post('/api/login', {
    //         data: {
    //             surname,
    //             roomNumber
    //         }
    //     })

    //     if (auth.data.data.status == true) {
    //         setIsAuthenticated(true)
    //         Cookies.set('session_token', auth.data.sessionToken)
    //         // console.log('auth.data.sessionToken: ', auth.data.sessionToken)
    //         toast.success(auth.data.data.message)
    //         return auth.data.data
    //     } else {
    //         setIsAuthenticated(false)
    //         toast.error(auth.data.data.message)
    //         return auth.data.data
    //     }
    // }

    const authGuestByPhone = async (phone: string) => {
        try {
            const response = await axiosInstance.post('/api/sms-auth/login', {
                data: { phone },
            })

            if (response.status === 200) {
                setIsAuthenticated(true)
                setCurrentUser({
                    id: response.data.guest.id,
                    name: response.data.guest.attributes.name,
                    role: response.data.guest.attributes.role,
                    phone: response.data.guest.attributes.phone,
                    approved: response.data.guest.attributes.approved
                })
                Cookies.set('session_token', response.data.token)

                toast.success('Авторизован')
                return response.data.guest
            } else if (response.status === 204) {
                setIsAuthenticated(false)
                toast.error('Переходим к регистрации')
                return null
            } else {
                throw new Error('Failed to log in')
            }
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    const registerGuest = async (phone: string, name: string, email: string) => {
        try {
            const response = await axios.post('/api/sms-auth/register', {
                data: { phone, name, email, role: 'user', },
            });

            if (response.status === 201) {
                const auth = await authGuestByPhone(phone)
                console.log('auth result: ', auth)
                return response.data
            } else if (response.status === 200) {
                return { status: false, message: 'Гость уже зарегистрирован' }
            } else {
                throw new Error('Failed to register guest')
            }
        } catch (error) {
            console.error('Registration error:', error)
            throw error
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

            if (decodedToken.accountId) {
                const user = await axiosInstance.post('/api/sms-auth/guest', {
                    data: { id: decodedToken.accountId },
                })

                if (user.status === 200) {
                    // console.log('user status 200: ', user.data.guest.attributes)
                    setCurrentUser({
                        id: user.data.guest.id,
                        name: user.data.guest.attributes.name,
                        role: user.data.guest.attributes.role,
                        phone: user.data.guest.attributes.phone,
                        approved: user.data.guest.attributes.approved
                    })
                    setIsAuthenticated(true)
                }
            }
        }
    }

    useEffect(() => {
        console.log('isPwaBannerHidden: ', isPwaBannerHidden)
    }, [isPwaBannerHidden])

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

    useEffect(() => {
        checkAuthToken()
        // console.log('isAuth: ', isAuthenticated)
    }, [isAuthenticated])

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            isPwaBannerHidden,
            setIsPwaBannerHidden,
            authGuestByPhone,
            registerGuest,
            currentUser,
            openAuthModal,
            closeAuthModal,
        }}>
            <AuthModal isOpen={authModalIsOpen} onClose={closeAuthModal} />
            <Button
                text={!isAuthenticated ? 'Модалка авторизации' : 'Вы авторизованы'}
                onClick={!isAuthenticated ? () => setAuthModalIsOpen(true) : () => { }}
            />

            <WelcomeScreen show={showWelcomeScreen} end={endWelcomeScreen} />
            {children}
        </AuthContext.Provider>
    )
}
