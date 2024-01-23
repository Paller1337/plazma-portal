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
import { getGuestAccountByBookingId } from 'helpers/session/guestAccount'
import OrderSendModal from '@/components/OrderSendModal'
import { GetServerSideProps } from 'next'
import { withAuthServerSideProps } from 'helpers/withAuthServerSideProps'
import { axiosInstance } from 'helpers/axiosInstance'
import Cookies from 'js-cookie'


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
    const { services } = state

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

    const handleCheckout = async () => {
        const token = Cookies.get('session_token')
        const res = await axiosInstance.post('/api/token/decode', {
            token
        })
        if (res.status === 200) {
            const decoded = res.data

            const guestAccount = await getGuestAccountByBookingId(decoded.bnovoBookingId)

            const serviceOrder = state.services.items.map(x => ({ service: parseInt(x.id), quantity: x.quantity }))
            const nowTime = DateTime.now().toISO()
            console.log('guestAccount: ', guestAccount)

            if (serviceOrder.length === 0) {
                toast.error('Ваша корзина пуста!')
                return
            }
            try {
                const response = await sendOrderToTelegram(state); // Предполагается, что здесь вызывается функция отправки заказа
                const responseStrapi = await createServiceOrder({
                    order: serviceOrder,
                    orderInfo: {
                        create_at: nowTime,
                        description: 'Тестовый комментарий',
                        status: 'new',
                        customer: {
                            name: guestAccount.attributes.firstName,
                            phone: guestAccount.attributes.phone,
                            room: guestAccount.attributes.roomId,
                            guest_account: guestAccount.id,
                        },
                        paymentType: 'bank-card',
                        previous_status: 'new',
                    }
                })

                if (response.message) {
                    // toast.success('Заказ успешно отправлен!')
                    console.log(state)
                    console.log('serviceOrder: ', serviceOrder)
                    dispatch({ type: 'CLEAR_CART', category: 'services' }); // Очистить корзину услуг
                    dispatch({ type: 'CLEAR_CART', category: 'food' });    // Очистить корзину еды
                }

                if (responseStrapi) {
                    // toast.success('Успешный заказ!')
                    setModalIsOpen(true)
                    console.log('responseStrapi: ', responseStrapi)
                    dispatch({ type: 'CLEAR_CART', category: 'services' }); // Очистить корзину услуг
                    dispatch({ type: 'CLEAR_CART', category: 'food' });    // Очистить корзину еды
                }
            } catch (error) {
                toast.error('Ошибка при отправке заказа.')
            }
        }
    }

    const closeModal = () => {
        setModalIsOpen(false);
    };

    return (<>

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
                        <div className='order-types__type active'>
                            Услуги
                        </div>

                        <div className='order-types__type'>
                            Еда и напитки
                        </div>
                    </div>
                    <div className='order-body'>
                        {services.items.length !== 0 ?
                            services.items.map((x, i) =>
                                <OrderItem
                                    key={i + x.title}
                                    productId={x.id}
                                    title={x.title}
                                    desc={x.price + ' ₽'}
                                    image={x.imageUrl}
                                    count={x.quantity}
                                    category='services'
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
                    <div className='order-score'>
                        <div className='order-score__amount'>
                            <span className='order-score__title'>Сумма заказа</span>
                            <span className='order-score__sum'>{services.total} ₽</span>
                        </div>
                        <div className='order-score__button' onClick={handleCheckout}>
                            <ReactSVG src='/svg/cart-white.svg' />
                            Оформить заказ
                        </div>
                    </div>
                </div>
            </div>


        </main>
        <NavBar page='services' />
    </>)
}