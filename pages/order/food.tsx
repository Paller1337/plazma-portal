import NavBar from '@/components/NavBar'
import { ReactSVG } from 'react-svg'
import Image from 'next/image'
import OrderItem from '@/components/OrderItem'
import { useCart } from 'context/CartContext'
import Router, { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from 'context/AuthContext'
import { createServiceOrder } from 'helpers/order/services'
import { DateTime } from 'luxon'
import { decodeToken } from 'helpers/login'
import { getGuestAccountByBookingId, getGuestAccountById } from 'helpers/session/guestAccount'
import OrderSendModal from '@/components/OrderSendModal'
import { GetServerSideProps } from 'next'
import { withAuthServerSideProps } from 'helpers/withAuthServerSideProps'
import { axiosInstance } from 'helpers/axiosInstance'
import Cookies from 'js-cookie'
import { Input, InputBase, LoadingOverlay, Select, Textarea } from '@mantine/core'
import { IMaskInput } from 'react-imask'
import { IGuestAccount } from 'types/session'
import Link from 'next/link'


export const getServerSideProps: GetServerSideProps = withAuthServerSideProps(async (context) => {
    try {

        return {
            props: {}
        }
    } catch (error) {
        console.error('Ошибка ...:', error)
        return {
            props: {}
        }
    }
})

export default function OrderServices(props) {
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const { state, dispatch } = useCart()
    const { food } = state
    const [visibleLoadingOverlay, setVisibleLoadingOverlay] = useState(false)

    const [guestAccount, setGuestAccount] = useState<{
        id: number,
        attributes: IGuestAccount
    }>(null)

    const [orderComment, setOrderComment] = useState('')
    const [orderPhone, setOrderPhone] = useState('')
    const [orderPayment, setOrderPayment] = useState('bank-card')

    const sendOrderToTelegram = async (order) => {
        try {
            const response = await fetch('/api/send-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(order)
            })

            if (!response.ok) {
                throw new Error('Не удалось отправить заказ')
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка при отправке заказа:', error)
            throw error;
        }
    }
    
    useEffect(() => {
        console.log('food: ', food)
        console.log('state: ', state)
    }, [food,state])
    useEffect(() => {
        const initGuestInfo = async () => {
            const token = Cookies.get('session_token')
            const res = await axiosInstance.post('/api/token/decode', {
                token
            })

            if (res.status === 200) {
                const decoded = res.data
                const resGuestAccount = await getGuestAccountById(decoded.accountId)
                
                console.log('resGuestAccount: ', resGuestAccount)
                setOrderPhone(resGuestAccount.attributes.phone)
                setGuestAccount(resGuestAccount)
                console.log('guestAccount: ', resGuestAccount)
            }
        }
        initGuestInfo()
    }, [])

    useEffect(() => {
        console.log('orderComment: ', orderComment)
        console.log('\orderPhone: ', orderPhone)
        console.log('\orderPayment: ', orderPayment)
    }, [orderComment, orderPhone, orderPayment])

    const handleCheckout = async () => {
        setVisibleLoadingOverlay(true)

        if (food.items.length === 0) return
        const token = Cookies.get('session_token')
        const res = await axiosInstance.post('/api/token/decode', {
            token
        })
        if (res.status === 200) {
            const decoded = res.data

            const guestAccount = await getGuestAccountById(decoded.accountId)

            const serviceOrder = state.food.items.map(x => ({ service: parseInt(x.id), quantity: x.quantity }))
            const nowTime = DateTime.now().toISO()
            console.log('guestAccount: ', guestAccount)

            if (serviceOrder.length === 0) {
                toast.error('Ваша корзина пуста!')
                return
            }
            try {
                const response = await sendOrderToTelegram(state); // Предполагается, что здесь вызывается функция отправки заказа
                // const responseStrapi = await createServiceOrder({
                //     order: serviceOrder,
                //     orderInfo: {
                //         create_at: nowTime,
                //         description: orderComment,
                //         status: 'new',
                //         customer: {
                //             name: guestAccount.attributes.firstName,
                //             phone: orderPhone,
                //             room: guestAccount.attributes.roomId,
                //             guest_account: guestAccount.id,
                //         },
                //         paymentType: orderPayment,
                //         previous_status: 'new',
                //     }
                // })

                if (response.message) {
                    toast.success('Заказ успешно отправлен!')
                    console.log(state)
                    console.log('serviceOrder: ', serviceOrder)
                    setModalIsOpen(true)
                    setVisibleLoadingOverlay(false)

                    dispatch({ type: 'CLEAR_CART', category: 'food' });    // Очистить корзину еды
                }

                // if (responseStrapi) {
                //     // toast.success('Успешный заказ!')
                //     setModalIsOpen(true)
                //     setVisibleLoadingOverlay(false)

                //     console.log('responseStrapi: ', responseStrapi)
                //     dispatch({ type: 'CLEAR_CART', category: 'food' });    // Очистить корзину еды
                // }
            } catch (error) {
                toast.error('Ошибка при отправке заказа.')
            }
        }
    }

    const closeModal = () => {
        setModalIsOpen(false)
    }

    const formatNumber = (n: string) => {
        if (!n) return
        n = n.replace(/[\(\)\-]/g, "")
        console.log(n)
        if (n[0] === '8') {
            return "+7" + n.slice(1)
        } else return n
    }
    return (<>
        <LoadingOverlay
            visible={visibleLoadingOverlay}
            zIndex={1000}
            overlayProps={{ radius: 'sm', blur: 2 }}
            loaderProps={{ color: 'gray', type: 'oval' }}
        />
        <OrderSendModal isOpen={modalIsOpen} onClose={closeModal} />
        <main>
            <div className='page-wrapper'>
                <div className='order'>
                    <div className='order-header'>
                        <h2 className='order-header__title'>
                            Заказы
                        </h2>

                        <div className='order-header__btn' onClick={() => Router.back()}>
                            <ReactSVG src='/svg/arrow-back-x16.svg' />
                            Назад
                        </div>
                    </div>
                    <div className='order-types'>
                        <Link className='order-types__type' href={'/order/services'}>
                            Услуги
                        </Link>

                        <div className='order-types__type active'>
                            Еда и напитки
                        </div>
                    </div>
                    <div className='order-body'>
                        {food.items.length !== 0 ?
                            food.items.map((x, i) =>
                                <OrderItem
                                    key={i + x.title}
                                    productId={x.id}
                                    title={x.title}
                                    desc={x.price + ' ₽'}
                                    image={x.imageUrl}
                                    count={x.quantity}
                                    category='food'
                                />
                            )
                            :
                            <span
                                style={{
                                    display: 'flex',
                                    height: '60px',
                                    width: '100%',
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                    fontWeight: 700,
                                }}
                            >Корзина пуста.</span>
                        }

                    </div>
                    <div className='order-footer'>
                        <InputBase
                            label='Номер для связи'
                            component={IMaskInput}
                            mask="+7 (000) 000-00-00"
                            placeholder="Ваш номер"
                            size='md'
                            radius='md'
                            onInput={e => {
                                // @ts-ignore
                                let value = e.target.value
                                if (value[4] === '8') {
                                    value = '+7'
                                }
                            }}
                            defaultValue={formatNumber(orderPhone)}
                            disabled={food.items.length === 0}
                        />

                        <Select
                            label='Способ оплаты'
                            size='md'
                            radius='md'
                            data={[
                                { value: 'cash', label: 'Наличные' },
                                { value: 'bank-card', label: 'Банковская карта' },
                            ]}
                            onChange={(v) => setOrderPayment(v)}
                            defaultValue={orderPayment}
                            disabled={food.items.length === 0}
                        />

                        <Textarea
                            size="md"
                            radius="md"
                            label="Комментарий к заказу"
                            placeholder='Ваш комментарий'
                            // @ts-ignore
                            onInput={(v) => setOrderComment(v.target.value)}
                            disabled={food.items.length === 0}
                        />

                        <div className='order-score'>
                            <div className='order-score__amount'>
                                <span className='order-score__title'>Сумма заказа</span>
                                <span className='order-score__sum'>{food.total} ₽</span>
                            </div>
                            <div className='order-score__button' onClick={handleCheckout}
                                style={food.items.length === 0 ? {
                                    pointerEvents: 'none',
                                    background: '#aaa'
                                } : {}}
                            >
                                <ReactSVG src='/svg/cart-white.svg' />
                                Оформить заказ
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </main>
        <NavBar page='services' />
    </>)
}