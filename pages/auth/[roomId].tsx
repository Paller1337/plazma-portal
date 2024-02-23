import Button from '@/components/Button'
import { LoadingOverlay, Select, TextInput } from '@mantine/core'
import { useAuth } from 'context/AuthContext'
import { getRooms } from 'helpers/bnovo/getRooms'
import authenticationPortal, { verifyToken } from 'helpers/login'
import { GetServerSideProps } from 'next'
import { Router, useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { ReactSVG } from 'react-svg'
import { TBnovoRoom, TBookingExtra } from 'types/bnovo'
import { debounce } from 'lodash'
import { getBookingCustomers } from 'helpers/bnovo/getBooking'
import { axiosInstance } from 'helpers/axiosInstance'
import WelcomeScreen from '@/components/WelcomeScreen'

interface AuthAsGuestPageProps {
    rooms: TBnovoRoom[]
    roomId: string
    customers: {
        name: string
        surname: string
        phone: string
    }[]
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const roomId = context.query.roomId

    const bnovoResponse = await axiosInstance(`/api/booking-room/${roomId}`)
    if (!bnovoResponse.data?.status) {
        console.error('Бронирования не существует')
        return {
            props: {
                rooms: [],
                roomId: roomId,
                customers: []
            } as AuthAsGuestPageProps
        }
    }

    const data = bnovoResponse.data.data as TBookingExtra
    const customers = getBookingCustomers(data)

    const customersRes = customers.map(x => ({ ...x, surname: x.surname.substring(0, 1) }))
    // console.log('surname: ', surname)

    // const token = context.req.cookies.session_token
    // const verify = verifyToken(token)
    // console.log('verify?: ', verify)

    // if (verify) {
    //     return {
    //         redirect: {
    //             destination: '/',
    //             permanent: false,
    //         },
    //     }
    // }

    try {
        const rooms = await getRooms()
        const availableRooms = rooms.filter(x => x.tags !== '')
        return {
            props: {
                rooms: availableRooms,
                roomId: roomId,
                customers: customersRes,
            } as AuthAsGuestPageProps
        }
    } catch (error) {
        console.error('Ошибка при получении услуг:', error)
        return {
            props: {
                rooms: [],
                roomId: '',
                customers: [],
            } as AuthAsGuestPageProps
        }
    }
}

export default function AuthPage(props: AuthAsGuestPageProps) {
    const [surname, setSurname] = useState('')
    const router = useRouter()
    const [visibleLoadingOverlay, setVisibleLoadingOverlay] = useState(false)
    const { isAuthenticated, login } = useAuth()

    const [customer, setCustomer] = useState(null)

    const [showWelcomeScreen, setShowWelcomeScreen] = useState(false)
    const [endWelcomeScreen, setEndWelcomeScreen] = useState(false)

    // useEffect(() => {
    //     console.log('auth.tsx isAuthenticated: ', isAuthenticated)
    //     if (isAuthenticated) router.push('/')
    // }, [isAuthenticated, router])

    useEffect(() => {
        console.log('customers: ', props.customers)
    }, [props.customers])

    const onLogin = async () => {
        let fullSurname = ''
        setVisibleLoadingOverlay(true)
        if (!customer || !surname || !props.roomId) return

        const isAuthRoom = await axiosInstance.post('/api/auth-room', {
            data: {
                name: customer.name,
                surname: surname,
                roomId: props.roomId
            }
        })
        if (isAuthRoom.status === 200) {
            console.log(isAuthRoom)
            toast.success('Успешно ', isAuthRoom.data.name)
            fullSurname = isAuthRoom.data.customer.surname
        } else {
            setVisibleLoadingOverlay(false)
        }

        if (fullSurname && props.roomId) {
            console.log(fullSurname, ' + ', props.roomId)
            const isAuth = await login(fullSurname, props.roomId)
            if (isAuth.status) {
                setVisibleLoadingOverlay(false)
                fullSurname = ''
            } else {
                setVisibleLoadingOverlay(false)
                fullSurname = ''
            }
        }
    }
    const roomName = props.rooms.find(x => x.id == +props.roomId).name

    // useEffect(() => {
    //     if (isAuthenticated) {
    //         setShowWelcomeScreen(true); // Показываем экран приветствия после аутентификации

    //         // Устанавливаем таймер для демонстрации экрана приветствия
    //         const timer = setTimeout(() => {
    //             // Осуществляем переход на страницу '/'
    //             router.push('/').then(() => {
    //                 // Задерживаем скрытие экрана приветствия на 300 мс после перехода
    //                 const hideScreenTimer = setTimeout(() => {
    //                     setShowWelcomeScreen(false); // Скрываем экран приветствия
    //                 }, 300); // Задержка перед скрытием экрана приветствия

    //                 return () => clearTimeout(hideScreenTimer); // Очистка таймера при размонтировании компонента
    //             });
    //         }, 2000); // Эмулируем длительность показа экрана приветствия

    //         return () => clearTimeout(timer); // Очистка таймера при размонтировании компонента
    //     }
    // }, [isAuthenticated, router]);

    return (<>
        <LoadingOverlay
            visible={visibleLoadingOverlay}
            zIndex={1000}
            overlayProps={{ radius: 'sm', blur: 2 }}
            loaderProps={{ color: 'gray', type: 'oval' }}
        />

        <main className='auth-page'>
            <div className='auth-page__wrapper'>
                <div className='auth-page__logo'>
                    <ReactSVG src='/svg/logo-dark-x128.svg' />
                </div>


                <div className='auth-page__your-room'>
                    <span className='title'>Ваш номер</span>
                    <span className='room'>{roomName[0].toUpperCase() + roomName.slice(1)}</span>
                </div>

                {!customer ?
                    <>
                        <span className='auth-page__memo'>
                            Выберите гостя для входа:
                        </span>

                        <div className='auth-page__customers'>
                            {props.customers.map((x, i) =>
                                <div className='auth-page__customer' key={'customer-' + i}>
                                    <span className='auth-page__customer-name'>{x.name} {x.surname}.</span>
                                    <div className='auth-page__customer-footer'>
                                        <Button text='Выбрать' stretch onClick={() => setCustomer(x)} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                    :
                    <div className='auth-page__form'>
                        <span className='auth-page__memo'>
                            {customer.name}, введите свою фамилию
                        </span>

                        <TextInput placeholder="Фамилия" className='' onChange={event => setSurname(event.currentTarget.value.toString())}
                            radius={'md'} size='lg'
                        />

                        <Button text='Войти' stretch onClick={onLogin} />
                    </div>
                }
            </div>
        </main>
    </>)
}