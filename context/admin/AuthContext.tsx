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
import { notify } from 'utils/notify';
import { LiaHandPeace } from 'react-icons/lia';
import FingerprintJS from '@fingerprintjs/fingerprintjs'

interface AuthContextType {
    isAuthenticated: boolean
    // authAdminByPhone: (phone: string) => Promise<{
    //     status: boolean;
    //     message: string;
    // }>
    authAdminByIdPassword: (id: number, password: string) => Promise<{
        status: boolean;
        message: string;
    }>
    logOut: () => void
    currentUser?: {
        id: number
        phone: string
        name: string
        role: string
        approved: boolean
    }
    visitorId: string
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const router = useRouter()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isPwaBannerHidden, setIsPwaBannerHidden] = useState(false)
    const [currentUser, setCurrentUser] = useState({ id: 0, phone: '', name: '', role: '', approved: false })
    const [visitorId, setVisitorId] = useState(null)

    const [showWelcomeScreen, setShowWelcomeScreen] = useState(false)
    const [endWelcomeScreen, setEndWelcomeScreen] = useState(false)

    const [authModalIsOpen, setAuthModalIsOpen] = useState(false)


    const logOut = () => {
        Cookies.remove('session_token')
        setIsAuthenticated(false)
        router.push('/admin/login')
    }

    // const authAdminByPhone = async (phone: string) => {
    //     try {
    //         const response = await axiosInstance.post('/api/admin/sms-auth/login', {
    //             data: { phone },
    //         })
    //         // console.log('admin: ', response.data)
    //         if (response.status === 200) {
    //             setIsAuthenticated(true)
    //             setCurrentUser({
    //                 id: response.data.guest.id,
    //                 name: response.data.guest.attributes.name,
    //                 role: response.data.guest.attributes.role,
    //                 phone: response.data.guest.attributes.phone,
    //                 approved: response.data.guest.attributes.approved
    //             })
    //             Cookies.set('session_token', response.data.token)

    //             toast.success('Авторизован')
    //             return response.data.guest
    //         } else if (response.status === 204) {
    //             setIsAuthenticated(false)
    //             toast.error('Переходим к регистрации')
    //             return null
    //         } else {
    //             throw new Error('Failed to log in')
    //         }
    //     } catch (error) {
    //         console.error(error)
    //         throw error
    //     }
    // }

    const authAdminByIdPassword = async (id: number, password: string) => {
        try {
            const response = await axiosInstance.post('/api/admin/auth/login', {
                data: {
                    id,
                    password,
                },
            })
            // console.log('admin: ', response.data)
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
                
                notify({
                    icon: <LiaHandPeace />,
                    title: 'С возвращением!',
                    message: 'Вы вошли в портал.',
                })
                return response.data.guest
            } else if (response.status === 204) {
                setIsAuthenticated(false)
                return null
            } else {
                throw new Error('Failed to log in')
            }
        } catch (error) {
            console.error(error)
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
                const user = await axiosInstance.post('/api/admin/sms-auth/guest', {
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
        FingerprintJS.load()
            .then(fp => fp.get())
            .then(result => {
                setVisitorId(result.visitorId)
                console.log('visitorId: ', result)
            })

    }, [])

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
            authAdminByIdPassword,
            currentUser,
            logOut,
            visitorId
        }}>
            {children}
        </AuthContext.Provider>
    )
}
