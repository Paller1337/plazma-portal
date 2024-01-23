import Button from '@/components/Button'
import { Select, TextInput } from '@mantine/core'
import { useAuth } from 'context/AuthContext'
import { getRooms } from 'helpers/bnovo/getRooms'
import authenticationPortal, { verifyToken } from 'helpers/login'
import { GetServerSideProps } from 'next'
import { Router, useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { ReactSVG } from 'react-svg'
import { TBnovoRoom } from 'types/bnovo'
import { debounce } from 'lodash'

// interface TBnovoRoom {
//     id: string
//     hotel_id: string
//     room_type_id: string
//     room_type_name: string
//     name: string
//     tags: string
//     sort_order: string
//     clean_status: string
//     room_type: string
// }

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

    const { isAuthenticated, login } = useAuth()
    const rooms = props.rooms.filter(x => x.tags !== '').map(room => ({
        value: room.id.toString(), // преобразуем ID в строку
        label: room.tags
    }))

    useEffect(() => {
        console.log('auth.tsx isAuthenticated: ', isAuthenticated)
        if (isAuthenticated) router.push('/')
    }, [isAuthenticated, router])

    // useEffect(() => {
    //     console.log('ROOMS: ', '\\n', rooms)
    // }, [])

    useEffect(() => {
        console.log(roomId,)
    }, [roomId])

    useEffect(() => {
        console.log(surname,)
    }, [surname])

    const onLogin = debounce(async () => {
        const isAuth = await login(surname, roomId)
        if (isAuth.status) {
            toast.success(isAuth.message)
        } else {
            toast.error(isAuth.message)
        }
    }, 300)


    
    return (<>
        <main className='auth-page'>
            <div className='auth-page__wrapper'>
                <div className='auth-page__logo'>
                    <ReactSVG src='/svg/logo-dark-x128.svg' />
                </div>

                <div className='auth-page__title'>
                    ВХОД В ГОСТЕВОЙ ПОРТАЛ
                </div>

                <div className='auth-page__form'>
                    <TextInput placeholder="Фамилия" className='' onChange={event => setSurname(event.currentTarget.value.toString())}
                        radius={'md'} size='lg'
                    />

                    <Select
                        mt="md"
                        size='lg'
                        radius={'md'}
                        comboboxProps={{ withinPortal: true }}
                        data={rooms}
                        placeholder="Комната"
                        searchable
                        onChange={value => setRoomId(value)}
                    />
                </div>
                <Button onClick={onLogin} text='Войти' stretch />
            </div>
        </main>
    </>)
}