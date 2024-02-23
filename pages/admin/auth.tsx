import Button from '@/components/Button'
import { LoadingOverlay, TextInput } from '@mantine/core'
import { useAuth } from 'context/admin/AuthContext'
import { verifyToken } from 'helpers/login'
import { GetServerSideProps } from 'next'
import { Router, useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { ReactSVG } from 'react-svg'
import { TBnovoRoom } from 'types/bnovo'
import { debounce } from 'lodash'



export const getServerSideProps: GetServerSideProps = async (context) => {
    const token = context.req.cookies.a_session_token
    const verify = verifyToken(token)

    console.log('verify?: ', verify)

    if (verify) {
        return {
            redirect: {
                destination: '/admin',
                permanent: false,
            },
        }
    }
    return {
        props: {}
    }
}

export default function AuthPage() {
    const [username, setUsername] = useState('')
    const [pass, setPass] = useState('')
    const router = useRouter()
    const [visibleLoadingOverlay, setVisibleLoadingOverlay] = useState(false)
    const successToastShownRef = useRef(false)

    const { isAdminAuthenticated, login } = useAuth()

    useEffect(() => {
        console.log('auth.tsx isAdminAuthenticated: ', isAdminAuthenticated)
        if (isAdminAuthenticated) router.push('/admin')
    }, [isAdminAuthenticated, router])



    useEffect(() => {
        console.log('user: ', username, '\npass: ', pass)
    }, [username, pass])

    const onLogin = debounce(async () => {
        setVisibleLoadingOverlay(true)

        const isAuth = await login(username, pass)
        if (isAuth.status) {
            setVisibleLoadingOverlay(false)
        } else {
            setVisibleLoadingOverlay(false)
        }
    }, 300)

    useEffect(() => {
        successToastShownRef.current = false
    }, [])

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

                <div className='auth-page__title'>
                    ВХОД
                </div>

                <div className='auth-page__form'>
                    <TextInput placeholder="Логин" className='' onChange={event => setUsername(event.currentTarget.value.toString())}
                        radius={'md'} size='lg'
                    />

                    <TextInput placeholder="Пароль" type='password' className='' onChange={event => setPass(event.currentTarget.value.toString())}
                        radius={'md'} size='lg'
                    />

                    <Button onClick={onLogin} text='Войти' stretch />
                </div>
            </div>
        </main>
    </>)
}