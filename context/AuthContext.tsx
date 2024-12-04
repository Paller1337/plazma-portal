import { verifyToken } from 'helpers/login'
import React, { createContext, useContext, useState, ReactNode, useEffect, Dispatch, SetStateAction, useCallback } from 'react'
import Cookies from 'js-cookie'
import { DEFAULTS } from 'defaults'
import { io } from 'socket.io-client'
import { checkOrderStatus } from 'helpers/order/order'
import toast from 'react-hot-toast'
import axios from 'axios'
import { axiosInstance } from 'helpers/axiosInstance'
import WelcomeScreen from '@/components/WelcomeScreen'
import { useRouter } from 'next/router'
import AuthModal from '@/components/AuthModal'
import Button from '@/components/Button'
import { useSubscribe } from 'helpers/push/subscribe'
import FingerprintJS from '@fingerprintjs/fingerprintjs'
import { FaCheckCircle } from 'react-icons/fa'
import { notify } from 'utils/notify'
import { LiaHandPeace } from "react-icons/lia"
import { usePortal } from './PortalContext'

interface AuthContextType {
    isAuthenticated: boolean
    isAuthProcessed: boolean
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
    registerGuest: (phone: string, name: string, email: string, isSubscribe: boolean) => Promise<{
        status: boolean
        message: string
        data?: any
        isSubscribe?: boolean
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
    visitorId: string
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const router = useRouter()
    const { portalSettings } = usePortal()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isAuthProcessed, setIsAuthProcessed] = useState(true)
    const [isPwaBannerHidden, setIsPwaBannerHidden] = useState(false)
    const [currentUser, setCurrentUser] = useState({ id: 0, phone: '', name: '', role: '', approved: false })

    const [showWelcomeScreen, setShowWelcomeScreen] = useState(false)
    const [endWelcomeScreen, setEndWelcomeScreen] = useState(false)
    const [visitorId, setVisitorId] = useState(null)

    const [authModalIsOpen, setAuthModalIsOpen] = useState(false)
    const closeAuthModal = () => setAuthModalIsOpen(false)
    const openAuthModal = () => setAuthModalIsOpen(true)

    const [notifyModalIsOpen, setNotifyModalIsOpen] = useState(false)
    const closeNotifyModal = () => setNotifyModalIsOpen(false)
    const openNotifyModal = () => setNotifyModalIsOpen(true)

    useEffect(() => { if (portalSettings?.debug) console.log({ currentUser }) }, [currentUser, portalSettings])
    useEffect(() => { if (portalSettings?.debug) console.log({ isAuthProcessed }) }, [isAuthProcessed, portalSettings])

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

    const registerGuest = async (phone: string, name: string, email: string, isSubscribe: boolean) => {
        try {
            const response = await axios.post('/api/sms-auth/register', {
                data: { phone, name, email, role: 'user', isSubscribe },
            });

            if (response.status === 201) {
                const auth = await authGuestByPhone(phone)
                if (portalSettings?.debug) console.log('auth result: ', auth)
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
        // setIsAuthProcessed(true)
        const token = Cookies.get('session_token')

        if (!token) {
            setIsAuthenticated(false)
            setIsAuthProcessed(false)
            return
        }
        const res = await axios.post('/api/token/decode', {
            token
        })

        // console.log({ decodeStatus: res.status })

        if (res.status === 200) {
            const decodedToken = res.data
            // console.log({ decodedToken })
            if (decodedToken.isExpired) {
                Cookies.remove('session_token')
                setIsAuthenticated(false)
                setIsAuthProcessed(false)
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
                    setIsAuthProcessed(false)
                }
            }
        }
    }

    useEffect(() => {
        if (portalSettings?.debug) console.log('isPwaBannerHidden: ', isPwaBannerHidden)
    }, [isPwaBannerHidden, portalSettings])

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

    useEffect(() => {
        if (portalSettings) {
            FingerprintJS.load()
                .then(fp => fp.get())
                .then(result => {
                    setVisitorId(result.visitorId)
                    if (portalSettings?.debug) console.log('visitorId: ', result)
                })
        }

    }, [portalSettings])

    const { getSubscription } = useSubscribe({ publicKey: 'BBu8PIpHwRr3d2B61zDh75x_GqvvBwn4sPxHIIu7D5fxaG0rEIiWPU8k6oc0vS-aaO3J8Jum19QjEFfT-hFJczs' })

    const onSubmitSubscribe = async () => {
        if (!visitorId) return
        try {
            console.log('subscription start')
            const permission = await Notification.requestPermission()
            if (permission !== 'granted') {
                throw { errorCode: "PermissionDenied" };
            }

            console.log('subscription permission ' + permission)

            // Получение объекта подписки с использованием функции getSubscription
            const subscription = await getSubscription()
            console.log(subscription)
            const res = await axiosInstance.post('/api/web-push/subscribe', {
                subscription: subscription,
                visitorId: visitorId,
                userId: currentUser.id,
            })

            console.log('push res: ' + res)
            // Вывод сообщения в случае успешной подписки
            console.log('Subscribe success');
        } catch (e) {
            // Вывод предупреждения в случае возникновения ошибки
            console.warn(e);
        }
    }

    const onSubmitPush = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await axiosInstance.post('/api/web-push/send', {
                message: 'Тестовое уведомление',
                title: 'Заголовок уведомления',
                visitorId: visitorId,
            })
            toast.success('Push success')
        } catch (e) {
            toast.error('Details console')
        }
    }, [visitorId])

    // const subscribe = async () => {
    //     const registration = await navigator.serviceWorker.ready;
    //     const subscription = await registration.pushManager.subscribe({
    //         userVisibleOnly: true,
    //         applicationServerKey: 'BBu8PIpHwRr3d2B61zDh75x_GqvvBwn4sPxHIIu7D5fxaG0rEIiWPU8k6oc0vS-aaO3J8Jum19QjEFfT-hFJczs' // Вставьте ваш публичный ключ VAPID
    //     });

    //     const res = await fetch(`${DEFAULTS.STRAPI.url}/subscription/subscribe`, { // URL вашего Strapi сервера
    //         method: 'POST',
    //         body: JSON.stringify(subscription),
    //         headers: {
    //             'Content-Type': 'application/json'
    //         }
    //     })

    //     console.log('subscription: ', res)
    // }

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            isAuthProcessed,
            isPwaBannerHidden,
            setIsPwaBannerHidden,
            authGuestByPhone,
            registerGuest,
            currentUser,
            openAuthModal,
            closeAuthModal,
            visitorId,
        }}>
            <AuthModal isOpen={authModalIsOpen} onClose={closeAuthModal} />
            {/* <AuthModal isOpen={notifyModalIsOpen} onClose={closeNotifyModal} />
            <Button
                text={!isAuthenticated ? 'Модалка авторизации' : 'Вы авторизованы'}
                onClick={!isAuthenticated ? () => setAuthModalIsOpen(true) : () => { }}
            />
            <Button
                text={'Подписаться на уведомления'}
                onClick={!isAuthenticated ? () => openNotifyModal() : () => { }}
            />

            <Button
                text={'Подписаться на уведомления'}
                onClick={onSubmitSubscribe}
            />

            <Button
                text={'Тестовое уведомление'}
                onClick={onSubmitPush}
            /> */}

            <WelcomeScreen show={showWelcomeScreen} end={endWelcomeScreen} />
            {children}
        </AuthContext.Provider>
    )
}
