import Button from '@/components/Button'
import { InputBase, LoadingOverlay, PasswordInput, PinInput, TextInput } from '@mantine/core'
import { useAuth } from 'context/admin/AuthContext'
import { verifyToken } from 'helpers/login'
import { GetServerSideProps } from 'next'
import { Router, useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { ReactSVG } from 'react-svg'
import { TBnovoRoom } from 'types/bnovo'
import { debounce } from 'lodash'
import AdminWrapper from '@/components/admin/AdminWrapper'
import { IMaskInput } from 'react-imask'
import { axiosInstance } from 'helpers/axiosInstance'
import { useDisclosure } from '@mantine/hooks'



export const getServerSideProps: GetServerSideProps = async (context) => {
    const token = context.req.cookies.session_token
    const verify = verifyToken(token)

    console.log('token?: ', token)
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
    const [visibleLoadingOverlay, setVisibleLoadingOverlay] = useState(false)
    const { authAdminByIdPassword, isAuthenticated } = useAuth()
    const router = useRouter()
    const [phone, setPhone] = useState('')
    const [phoneValue, setPhoneValue] = useState('+7')
    const [visible, { toggle }] = useDisclosure(false)

    const [guestChecked, setGuestChecked] = useState(null)
    const [registerData, setRegisterData] = useState(null)
    const [loginData, setLoginData] = useState(null)

    const [isRegistered, setIsRegistered] = useState(false)

    const [loginStep, setLoginStep] = useState(0)

    const [passError, setPassError] = useState('')
    const [regPass1, setRegPass1] = useState('')
    const [regPass2, setRegPass2] = useState('')

    const [password, setPassword] = useState('')

    const formatNumber = (n: string) => {
        if (!n) return ""
        n = n.replace(/[\(\)\-\ ]/g, "")

        if (n.startsWith("+7")) {
            if (n[2] === '8') {
                return "+7" + n.slice(3)
            }
            return n
        }

        if (n[0] === '8') {
            n = "+7" + n.slice(1);
            if (n[2] === '8') {
                return "+7" + n.slice(3)
            }
            return n
        }

        return n
    }




    const check = async () => {
        const response = await axiosInstance.post('/api/admin/auth/check', {
            data: { phone },
        })

        console.log('check: ', response.data)
        if (response.status === 200) {
            // console.log('check: ', response.data)
            setGuestChecked(response.data)
        } else {
            toast.error('Администратор не найден')
        }

    }


    const register = async () => {
        if (!guestChecked || !guestChecked.guest?.id) return
        if ((regPass1 !== regPass2) || regPass1.length < 5) return
        const response = await axiosInstance.post('/api/admin/auth/register', {
            data: {
                id: guestChecked.guest.id,
                password: regPass1,
            },
        })

        setIsRegistered(response.data.status)
        console.log('register: ', response.data)
        if (response.status === 200) {
            setRegisterData(response.data)
        } else {
            toast.error('Администратор не найден')
        }
    }

    const login = async () => {
        if (!guestChecked) {
            console.log('!guestChecked')
            return
        }
        if (!password || password.length < 4) {
            console.log('(regPass1 !== regPass2) || regPass1.length < 5')
            return
        }

        authAdminByIdPassword(guestChecked.guest.id, password).then((adminFound) => {
            if (adminFound) {
                setVisibleLoadingOverlay(true)
                console.log('adminFound: ', adminFound)
                router.push('/admin')
            } else {
                toast.error('Неверный номер телефона')
            }
        }).catch((error) => {
            if (error.status === 401) {
                setPassError(error.response.data.message)
            }
            console.error('Error fetching guest by phone:', error)
        });

        // console.log('login: ', response.data)
        // if (response.status === 200) {
        //     setLoginData(response.data)
        // } else {
        //     toast.error('Администратор не найден')
        // }
    }
    // const login = async () => {
    //     if (codeIsSend && codeTimer) {
    //         // console.log('Код уже отправлен, следующая попытка через ', intervalHold, ' секунд')
    //         return
    //     }
    //     console.log(axiosInstance)
    //     const response = await axiosInstance.post('/api/admin/sms-auth/login', {
    //         data: { phone },
    //     })

    //     if (response.status === 200) {
    //         // sendCode()
    //     } else {
    //         toast.error('Администратор не найден')
    //     }

    // }
    // const sendCode = () => {
    //     if (codeIsSend && codeTimer) {
    //         // console.log('Код уже отправлен, следующая попытка через ', intervalHold, ' секунд')
    //         return
    //     }
    //     if (!phone || phone.length != 12) {
    //         // console.log('Неверный номер телефона')
    //         return
    //     }

    //     setCodeIsSend(true)
    //     setCodeTimer(true)
    //     setIntervalHold(5)
    //     console.log('Запущен таймер на 5 секунд: ', codeTimer)
    //     const timer = setTimeout(() => {
    //         setCodeIsSend(true)
    //         setCodeTimer(false)
    //         console.log('Можно попробовать еще раз: ', codeTimer)
    //     }, 5000)

    //     const interval = setInterval(() => {
    //         setIntervalHold(p => {
    //             if (p <= 1) {
    //                 clearInterval(interval)
    //                 setSmsCode(generateSmsCode())
    //             }
    //             return p - 1
    //         })
    //     }, 1000)

    //     return () => {
    //         setCodeTimer(false)
    //         clearTimeout(timer)
    //         clearInterval(interval)
    //     }
    // }


    // useEffect(() => {
    //     console.log(inputPin)
    //     if (inputPin && inputPin.length === 4) {
    //         if (smsCode === inputPin) {
    //             console.log('Успешно')
    //             authAdminByPhone(phone).then((adminFound) => {
    //                 if (adminFound) {
    //                     setVisibleLoadingOverlay(true)
    //                     console.log('adminFound: ', adminFound)
    //                     router.push('/admin')
    //                 } else {
    //                     toast.error('Неверный номер телефона')
    //                 }
    //             }).catch((error) => {
    //                 console.error('Error fetching guest by phone:', error)
    //             });
    //         } else {
    //             setCodeIsFailed(true)
    //             setPinValue('')
    //         }
    //     }
    // }, [inputPin, phone, smsCode])

    useEffect(() => {
        document.getElementById('__next').classList.add('admin-wrapper')
    }, [])


    // const onLogin = debounce(async () => {
    //     setVisibleLoadingOverlay(true)

    //     const isAuth = await login(username, pass)
    //     if (isAuth.status) {
    //         setVisibleLoadingOverlay(false)
    //     } else {
    //         setVisibleLoadingOverlay(false)
    //     }
    // }, 300)



    return (<>
        <LoadingOverlay
            visible={visibleLoadingOverlay}
            zIndex={1000}
            overlayProps={{ radius: 'sm', blur: 2 }}
            loaderProps={{ color: 'gray', type: 'oval' }}
        />
        <main className='admin-main'>
            <div className='admin-login'>
                <div className='admin-login__image'>
                    <img src='/images/admin/login-img1.png' alt='' />
                </div>
                <div className='admin-login__auth-frame'>
                    <div className='admin-login__form-wrap'>
                        <div className='admin-login__form-header'>
                            <ReactSVG className='admin-login__form-logo' src='/svg/logo-dark-48.svg' />
                            <span className='admin-login__form-hs' />
                            <div className='admin-login__form-info'>
                                <span className='admin-login__form-title'>Панель администратора</span>
                                <span className='admin-login__form-partition'>
                                    Вход
                                </span>
                            </div>
                        </div>
                        <div className='admin-login__form'>
                            <div className='Auth-Modal__form'>
                                <InputBase
                                    label='Номер телефона'
                                    withAsterisk
                                    component={IMaskInput}
                                    mask="+7 (000) 000-00-00"
                                    placeholder="Ваш номер"
                                    size='md'
                                    radius='md'
                                    w={'100%'}
                                    value={phoneValue}
                                    onInput={e => {
                                        // @ts-ignore
                                        let value = e.target.value
                                        // console.log('value[4] ', value[4])
                                        if (value[4] == '8') {
                                            setPhoneValue('+7')
                                        } else {
                                            setPhoneValue(value)
                                        }

                                        // @ts-ignore
                                        setPhone(formatNumber(e.target.value.toString()))
                                    }}
                                    defaultValue={'+7'}
                                    disabled={guestChecked}
                                />

                                {guestChecked?.admin.status && !isRegistered
                                    ? <>
                                        <PasswordInput
                                            mt={12}
                                            size="md"
                                            radius="md"
                                            w={'100%'}
                                            label="Придумайте пароль"
                                            placeholder="Введите пароль"
                                            visible={visible}
                                            onVisibilityChange={toggle}
                                            // @ts-ignore
                                            onInput={e => setRegPass1(e.target.value)}
                                        />
                                        <PasswordInput
                                            size="md"
                                            radius="md"
                                            w={'100%'}
                                            label="Повторите пароль"
                                            placeholder="Повторите пароль"
                                            visible={visible}
                                            onVisibilityChange={toggle}
                                            // @ts-ignore
                                            onInput={e => setRegPass2(e.target.value)}
                                            error={(regPass1 !== regPass2) && regPass2.length > 0 ? 'Пароли не совпадают' : ''}
                                        />
                                    </>
                                    : guestChecked ?
                                        <PasswordInput
                                            size="md"
                                            radius="md"
                                            w={'100%'}
                                            label="Пароль"
                                            placeholder="Введите пароль"
                                            onInput={e => {
                                                // @ts-ignore
                                                setPassword(e.target.value)
                                                setPassError('')
                                            }}
                                            error={passError.length > 0 ? passError : ''}
                                        />
                                        : <></>
                                }
                                {/* {codeIsSend ?
                                    <div className='Auth-Modal__form-hidden'>
                                        <span>Введите код из SMS</span>
                                        <PinInput
                                            type={/^[0-9]*$/}
                                            inputType="tel"
                                            inputMode="numeric"
                                            onComplete={e => setInputPin(e)}
                                            oneTimeCode
                                            error={codeIsFailed}
                                            size='lg'
                                            radius={'md'}
                                            value={pinValue}
                                            onChange={e => {
                                                setPinValue(e)
                                                // console.log('pin code ', e)
                                            }}
                                        />
                                        <span className={`error${codeIsFailed ? ' visible' : ''}`}>неверный код</span>
                                    </div> :
                                    <></>
                                } */}
                                {/* <Button
                                    text={codeTimer ? `Следующая попытка через ${intervalHold} секунд` : 'Отправить код SMS'}
                                    stretch
                                    bgColor='#56754B'
                                    color='#fff'
                                    onClick={() => login()}
                                    disabled={codeTimer || formatNumber(phoneValue).length < 12}
                                /> */}
                                {!guestChecked ?
                                    <Button
                                        text={'Далее'}
                                        stretch
                                        bgColor='#56754B'
                                        color='#fff'
                                        onClick={() => check()}
                                        disabled={formatNumber(phoneValue).length < 12}
                                    />
                                    : guestChecked?.admin.status && !isRegistered
                                        ? <Button
                                            text={'Зарегистрироваться'}
                                            stretch
                                            bgColor='#56754B'
                                            color='#fff'
                                            onClick={() => register()}
                                            disabled={(regPass1 !== regPass2) || regPass1.length < 4}
                                        /> :
                                        <Button
                                            text={'Войти'}
                                            stretch
                                            bgColor='#56754B'
                                            color='#fff'
                                            onClick={() => login()}
                                            disabled={!password || password.length < 4}
                                        />
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main >
    </>)
}