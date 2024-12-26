import React, { useEffect, useState } from 'react'
import ReactModal from 'react-modal'
import Button from './Button'
import { ReactSVG } from 'react-svg'
import { useRouter } from 'next/router'
// import { IProduct } from 'pages/store/[id]'
import { DEFAULTS } from 'defaults'
import { useCart } from 'context/CartContext'
import { InputBase, Paper, PinInput, Text, Stack, Switch, TextInput, Group } from '@mantine/core'
import { IMaskInput } from 'react-imask'
import toast from 'react-hot-toast'
import axios from 'axios'
import { axiosInstance } from 'helpers/axiosInstance'
import { useAuth } from 'context/AuthContext'
import { sendAuthCode } from 'helpers/send-code'
import { FaCheckCircle, FaSms } from 'react-icons/fa'
import { notify } from 'utils/notify'
import { usePortal } from 'context/PortalContext'

ReactModal.setAppElement('#__next')

interface IProps {
    isOpen: boolean,
    onClose: () => void,
    storeId?: string,
    // product?: IProduct
}




const AuthModal = (props: IProps) => {
    const { authGuestByPhone, registerGuest } = useAuth()
    const { portalSettings } = usePortal()
    const router = useRouter()
    const [currentSlide, setCurrentSlide] = useState(0)
    const [phone, setPhone] = useState('')
    const [phoneValue, setPhoneValue] = useState('+7')

    const [codeIsSend, setCodeIsSend] = useState(false)
    const [codeTimer, setCodeTimer] = useState(false)
    const [codeIsFailed, setCodeIsFailed] = useState(false)
    const codeHoldTimeout = 5000

    const [intervalHold, setIntervalHold] = useState(5)
    const [smsCode, setSmsCode] = useState('')

    const [inputPin, setInputPin] = useState('')
    const [pinValue, setPinValue] = useState('')

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [isSubscribe, setIsSubscribe] = useState(false)
    const [error, setError] = useState('')

    const [guest, setGuest] = useState(null)

    const emailRegex = /^\S+@\S+\.\S+$/

    const handleEmailChange = (event) => {
        setEmail(event.target.value)
        if (emailRegex.test(event.target.value)) {
            setError('')
        } else {
            setError('Неправилньый адрес почты')
        }
    }

    const handleSubscribeChange = (event) => {
        console.log({ event })
        setIsSubscribe(event.target.checked)
    }

    const handleNameChange = (event) => setName(event.target.value)

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


    const sendCode = async () => {
        if (codeIsSend && codeTimer) {
            console.log('Код уже отправлен, следующая попытка через ', intervalHold, ' секунд')
            return
        }
        if (!phone || phone.length != 12) {
            console.log('Неверный номер телефона')
            return
        }

        setCodeIsSend(true)
        setCodeTimer(true)
        setIntervalHold(codeHoldTimeout / 1000)
        console.log(`Запущен таймер на ${codeHoldTimeout / 1000} секунд: `, codeTimer)

        const timer = setTimeout(() => {
            setCodeIsSend(true)
            setCodeTimer(false)
            console.log('Можно попробовать еще раз')
        }, codeHoldTimeout)

        const smsCode = await sendAuthCode(phone, portalSettings?.debug)
        setSmsCode(smsCode)
        const interval = setInterval(() => {
            setIntervalHold(p => {
                if (p <= 1) {
                    clearInterval(interval)
                }
                return p - 1
            })
        }, 1000)

        return () => {
            setCodeTimer(false)
            clearTimeout(timer)
            clearInterval(interval)
        }
    }

    // const login = () => { }

    const register = async () => {
        if (emailRegex.test(email)) {
            console.log({ name, email, phone });
            const result = await registerGuest(phone, name, email, isSubscribe)
            if (result.data.id) {
                notify({
                    icon: <FaCheckCircle />,
                    title: 'Добро пожаловать',
                    message: 'Вы зарегистрировались.',
                })
                props.onClose()
            }
            console.log('register result: ', result)
        } else {
            setError('Неправилньый адрес почты')
        }
    }

    useEffect(() => {
        // console.log(inputPin)
        if (inputPin && inputPin.length === 4) {
            if (smsCode === inputPin) {
                console.log('Успешно')
                authGuestByPhone(phone).then((guestFound) => {
                    if (guestFound) {
                        setGuest(guestFound)
                        props.onClose()
                        console.log('guestFound: ', guestFound)
                    } else {
                        setCurrentSlide(1) // Переключение на слайд регистрации
                    }
                }).catch((error) => {
                    console.error('Error fetching guest by phone:', error)
                });
            } else {
                setCodeIsFailed(true)
                setPinValue('')
            }
        }
    }, [inputPin, phone, smsCode])

    useEffect(() => {
        if (pinValue.length != 0) setCodeIsFailed(false)
    }, [pinValue])



    return (
        <ReactModal
            isOpen={props.isOpen}
            onRequestClose={props.onClose}
            className="Auth-Modal"
            overlayClassName="Overlay"
        // shouldCloseOnOverlayClick={false}
        >
            <div className="Auth-Modal__content">
                <ReactSVG className='Auth-Modal__close' src='/svg/modal-close.svg' onClick={props.onClose} />
                <div className='Auth-Modal__slides' style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                    <div className='Auth-Modal__slide'>
                        <div className='Auth-Modal__heading'>
                            <span className='title'>Вход</span>
                            <span className='description'>Войдите по своему номеру телефона</span>
                        </div>
                        <div className='Auth-Modal__form'>
                            <InputBase
                                label='Номер для связи'
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
                                disabled={codeTimer}
                            />
                            {codeIsSend ?
                                <div className='Auth-Modal__form-hidden'>
                                    <span>Введите код из SMS</span>
                                    <PinInput
                                        autoFocus
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
                                <Paper mt={12} radius={'md'} p={12} style={{ border: '1px solid rgb(86, 117, 75)' }}>
                                    <Group gap={12} wrap='nowrap'>
                                        <Stack
                                            bg={'rgb(86, 117, 75)'}
                                            p={6}
                                            style={{ borderRadius: 32 }}
                                            justify='center'
                                            align='center'
                                        >
                                            <FaSms size={18} color='white' />
                                        </Stack>
                                        <Text fz={15} fw={500}  >Мы отправим вам SMS сообщение с кодом для входа</Text>
                                    </Group>
                                </Paper>
                            }
                        </div>
                        <div className="Auth-Modal__actions">
                            <Button
                                text={codeTimer ? `Следующая попытка через ${intervalHold} секунд` : 'Отправить код SMS'}
                                stretch
                                bgColor='#56754B'
                                color='#fff'
                                onClick={() => sendCode()}
                                disabled={codeTimer || formatNumber(phoneValue).length < 12}
                            />
                            {/* <Button text='Войти' stretch bgColor='#56754B' color='#fff' onClick={() => login()} /> */}
                        </div>
                    </div>


                    <div className='Auth-Modal__slide'>
                        <div className='Auth-Modal__heading'>
                            <span className='title'>Шаг 2</span>
                            <span className='description'>Это нужно чтобы мы могли нормально коммуницировать</span>
                        </div>
                        <div className='Auth-Modal__form'>
                            <Stack gap={12}>
                                <TextInput
                                    label="Как к вам обращаться?"
                                    withAsterisk
                                    placeholder="Имя"
                                    inputWrapperOrder={['label', 'input', 'error']}
                                    w={'100%'}
                                    size='md'
                                    radius='md'
                                    value={name}
                                    onChange={handleNameChange}
                                />

                                <TextInput
                                    label="Почта"
                                    inputWrapperOrder={['label', 'input', 'error']}
                                    w={'100%'}
                                    size='md'
                                    radius='md'
                                    placeholder="ваша-почта@yandex.ru"
                                    value={email}
                                    onChange={handleEmailChange}
                                    error={error}
                                />

                                <Paper radius={'md'} p={12} style={{ border: '1px solid rgb(86, 117, 75)' }}>
                                    <Switch
                                        defaultValue={isSubscribe.toString()}
                                        onChange={handleSubscribeChange}
                                        label='Я хочу получать информацию об акциях и специальных предложениях'
                                        styles={{
                                            label: {
                                                fontSize: 13,
                                            },
                                            body: {
                                                alignItems: 'center'
                                            }
                                        }}
                                    />
                                </Paper>
                            </Stack>
                        </div>
                        <div className="Auth-Modal__actions">
                            <Button text='Зарегистрироваться' stretch bgColor='#56754B' color='#fff' onClick={() => register()} />
                        </div>
                    </div>
                </div>
            </div>
        </ReactModal>
    );
};

export default AuthModal
