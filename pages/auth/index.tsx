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
import { TBnovoRoom } from 'types/bnovo'
import { debounce } from 'lodash'
import WelcomeScreen from '@/components/WelcomeScreen'
import useIsPwa from 'helpers/frontend/pwa'

interface AuthPageProps {
    rooms: TBnovoRoom[]
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const token = context.req.cookies.session_token
    const verify = verifyToken(token)
    console.log('verify?: ', verify)

    if (verify) {
        return {
            redirect: {
                destination: '/',
                permanent: false,
            },
        }
    }

    try {
        const rooms = await getRooms()
        const availableRooms = rooms.filter(x => x.tags !== '')
        return {
            props: {
                rooms: availableRooms
            } as AuthPageProps
        }
    } catch (error) {
        console.error('Ошибка при получении услуг:', error)
        return {
            props: {
                rooms: []
            } as AuthPageProps
        }
    }
}



export default function AuthPage(props: AuthPageProps) {
    const [roomId, setRoomId] = useState('')
    const [surname, setSurname] = useState('')
    const router = useRouter()
    const [visibleLoadingOverlay, setVisibleLoadingOverlay] = useState(false)
    const successToastShownRef = useRef(false)

    const [showWelcomeScreen, setShowWelcomeScreen] = useState(false)

    const { isAuthenticated, login } = useAuth()
    const rooms = props.rooms.filter(x => x.tags !== '').map(room => ({
        value: room.id.toString(), // преобразуем ID в строку
        label: room.tags
    }))

    // useEffect(() => {
    //     console.log('auth.tsx isAuthenticated: ', isAuthenticated)
    //     if (isAuthenticated) router.push('/')
    // }, [isAuthenticated, router])

    useEffect(() => {
        console.log(roomId,)
    }, [roomId])

    useEffect(() => {
        console.log(surname,)
    }, [surname])

    const onLogin = debounce(async () => {
        setVisibleLoadingOverlay(true)

        const isAuth = await login(surname, roomId)
        if (isAuth.status) {
            setVisibleLoadingOverlay(false)
        } else {
            setVisibleLoadingOverlay(false)
        }
    }, 300)


    useEffect(() => {
        if (isAuthenticated) {
            setShowWelcomeScreen(true);
            const timer = setTimeout(() => {
                // После 2 секунд проверяем, готова ли страница к переходу
                router.push('/home').then(() => {
                    // Закрываем экран приветствия после завершения загрузки страницы
                    setShowWelcomeScreen(false)
                })
            }, 2000)

            return () => clearTimeout(timer)
        }
    }, [isAuthenticated, router])

    const pwa = useIsPwa()

    function requestNotificationPermission() {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Разрешение на отправку уведомлений получено');
                // Здесь вы можете запустить логику для отображения уведомлений
            } else if (permission === 'denied') {
                console.log('Пользователь отказал в разрешении на отправку уведомлений');
            } else {
                console.log('Пользователь закрыл запрос на разрешение без его выбора');
            }
        });
    }

    return (<>
        <LoadingOverlay
            visible={visibleLoadingOverlay}
            zIndex={1000}
            overlayProps={{ radius: 'sm', blur: 2 }}
            loaderProps={{ color: 'gray', type: 'oval' }}
        />

        <main className='auth-page'>
            <div className='auth-page__wrapper'>
                <div className='auth-page__logo' style={{ margin: 'auto 0' }}>
                    <ReactSVG src='/svg/logo-dark-x128.svg' />
                </div>

                <div className='auth-page__title' style={{ margin: 'auto 0 20px 0' }}>
                    ВХОД В ГОСТЕВОЙ ПОРТАЛ
                </div>

                <div className='auth-page__form' style={{ margin: '0 0 auto 0' }}>
                    <TextInput placeholder="Фамилия" className='' onChange={event => setSurname(event.currentTarget.value.toString())}
                        radius={'md'} size='lg'
                    />

                    <Select
                        mb={'md'}
                        size='lg'
                        radius={'md'}
                        comboboxProps={{ withinPortal: true }}
                        data={rooms}
                        placeholder="Комната"
                        searchable
                        onChange={value => setRoomId(value)}
                    />

                    <Button onClick={onLogin} text='Войти' stretch />

                    {/* {pwa ? */}
                    {/* <Button onClick={() => router.push('/auth/qr')} text='Войти по QR' stretch /> */}
                    {/* // : <></>} */}
                </div>
            </div>
        </main>
    </>)
}