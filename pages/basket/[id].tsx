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
import { Input, InputBase, Loader, LoadingOverlay, Select, Textarea } from '@mantine/core'
import { IMaskInput } from 'react-imask'
import { IGuestAccount } from 'types/session'
import Link from 'next/link'


export const getServerSideProps: GetServerSideProps = withAuthServerSideProps(async (context) => {
    const { id } = context.params
    try {

        return {
            props: {
                id: id
            }
        }
    } catch (error) {
        console.error('Ошибка ...:', error)
        return {
            props: {}
        }
    }
})

export default function OrderServices(props) {
    const { isAuthenticated, openAuthModal, currentUser } = useAuth()
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const { state, dispatch, productsInfo, storesInfo, hotelRooms } = useCart()
    const [visibleLoadingOverlay, setVisibleLoadingOverlay] = useState(false)
    
    const router = useRouter()
    const currentStoreState = state.stores[props.id]
    const total = currentStoreState?.order?.reduce((acc, curr) => acc + productsInfo[curr.id.toString()]?.price * curr.quantity, 0) || 0

    const [room, setRoom] = useState({
        value: '',
        label: '',
        error: '',
    })


    const [orderPhone, setOrderPhone] = useState({
        value: currentUser.phone || '',
        error: ''
    })

    const rooms = hotelRooms?.filter(x => x.tags !== '').map(room => ({
        value: room.id.toString(),
        label: room.tags
    }))

    const [guestAccount, setGuestAccount] = useState<{
        id: number,
        attributes: IGuestAccount
    }>(null)

    const [orderComment, setOrderComment] = useState('')
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

    const placeOrder = async (orderData) => {
        try {
            const response = await axiosInstance.post('/api/order/create', orderData)
            if (response.status === 200) {
                console.log('Order placed successfully:', response.data)
                return { data: response.data, status: true }
            } else {
                console.error('Error placing order:', response.data)
                return { data: response.data, status: false }
            }
        } catch (error) {
            console.error('Error placing order:', error)
            return { data: null, status: false }
        }
    }

    useEffect(() => {
        // console.log('props.id: ', props.id)
        // console.log('state.stores[props.id]: ', state)
        // state.stores[props.id]
        console.log('currentStoreState: ', currentStoreState)
    }, [])

    useEffect(() => {
        if (isAuthenticated) {
            const initGuestInfo = async () => {
                const token = Cookies.get('session_token')
                const res = await axiosInstance.post('/api/token/decode', {
                    token
                })

                if (res.status === 200) {
                    const decoded = res.data
                    const resGuestAccount = await getGuestAccountById(decoded.accountId)

                    console.log('resGuestAccount: ', resGuestAccount)
                    setOrderPhone(p => ({ ...p, value: resGuestAccount.attributes.phone }))
                    setGuestAccount(resGuestAccount)
                    console.log('guestAccount: ', resGuestAccount)
                }
            }
            initGuestInfo()
        }
    }, [isAuthenticated])

    const handleCheckout = async () => {
        // console.log('currentStoreState: ', currentStoreState)
        // console.log('orderPhone: ', orderPhone)
        // if (currentStoreState) return
        if (!room.label || !room.value) {
            setRoom(p => ({
                ...p,
                error: 'Выберите комнату'
            }))
        }

        if (!orderPhone.value || orderPhone.value.length < 12) {
            setOrderPhone(p => ({
                ...p,
                error: 'Неверный номер телефона'
            }))
        }

        if (currentStoreState.order.length === 0 || !room.label || !room.value || !orderPhone.value || orderPhone.value.length < 12) return

        setVisibleLoadingOverlay(true)
        const token = Cookies.get('session_token')
        const res = await axiosInstance.post('/api/token/decode', {
            token
        })
        if (res.status === 200) {
            const decoded = res.data
            // console.log('store decoded token: ', decoded)

            const serviceOrder = currentStoreState.order.map(item => ({
                id: item.id,
                quantity: item.quantity,
                price: productsInfo[item.id.toString()]?.price,
                name: productsInfo[item.id.toString()]?.name,
            }))

            const nowTime = DateTime.now().toISO()


            if (serviceOrder.length === 0) {
                toast.error('Ваша корзина пуста!')
                return
            }
            try {
                const orderIsPlace = await placeOrder({
                    guest: currentUser.id, // ID гостя
                    create_at: new Date().toISOString(),
                    completed_at: null,
                    status: 'new',
                    previous_status: 'none',
                    paymentType: orderPayment,
                    comment: orderComment,
                    phone: orderPhone.value,
                    room: {
                        label: room.label,
                        roomId: room.value,
                    },
                    products: currentStoreState.order.map(p => ({
                        product: p.id,
                        quantity: p.quantity,
                    })),
                    type: storesInfo[props.id]?.store_type.id,
                    store: storesInfo[props.id]?.id,
                })

                if (!orderIsPlace.status) return

                const orderToTelegram = {
                    id: orderIsPlace.data.data.id,
                    time: DateTime.fromISO(nowTime).toLocaleString(DateTime.DATETIME_MED),
                    comment: orderComment,
                    type: storesInfo[props.id]?.store_type.label,
                    phone: orderPhone.value,
                    room: {
                        label: room.label,
                        roomId: room.value,
                    },
                    payment: orderPayment,
                    items: serviceOrder,
                    total: total,
                    status: 'new',
                    store: storesInfo[props.id]?.title,
                    guest: guestAccount?.attributes.name
                }

                const response = await sendOrderToTelegram(orderToTelegram) // Предполагается, что здесь вызывается функция отправки заказа
                console.log('tg response: ', response)
                if (response.message && orderIsPlace) {
                    toast.success('Заказ успешно отправлен!')
                    setOrderComment('')
                    dispatch({ type: 'CLEAR_CART', storeId: props.id })
                    // console.log(`/basket/${Object.keys(storesInfo).find(x => x != props.id)}`)
                    router.push(`/basket/${Object.keys(storesInfo).find(x => x != props.id) || 0}`)
                    // console.log(state)
                    // console.log('serviceOrder: ', serviceOrder)
                    setModalIsOpen(true)
                    setVisibleLoadingOverlay(false)

                }


            } catch (error) {
                toast.error('Ошибка при отправке заказа.')
            }
        }
    }

    const closeModal = () => {
        setModalIsOpen(false)
    }

    const formatNumber = (n: string) => {
        if (!n) return "";
        n = n.replace(/[\(\)\-\ ]/g, "");

        // Если номер начинается с +7, проверяем дальнейшие цифры
        if (n.startsWith("+7")) {
            if (n[2] === '8') {
                return "+7" + n.slice(3); // Убираем 8 после +7
            }
            return n;
        }

        // Если номер начинается с 8, заменяем её на +7 и убираем следующую 8, если она есть
        if (n[0] === '8') {
            n = "+7" + n.slice(1);
            if (n[2] === '8') {
                return "+7" + n.slice(3); // Убираем следующую 8 после замены
            }
            return n;
        }

        return n;
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
                        {Object.keys(storesInfo).map(x => {
                            if (props.id == storesInfo[x].id) return (
                                <div className='order-types__type active' key={storesInfo[x].title}>
                                    {storesInfo[x].title}
                                </div>
                            )
                            return (
                                <Link className='order-types__type' href={'/basket/' + storesInfo[x].id} key={storesInfo[x].title} >
                                    {storesInfo[x].title}
                                </Link>
                            )
                        })
                        }
                    </div>
                    <div className='order-body'>
                        {currentStoreState && currentStoreState?.order?.length !== 0 ?
                            productsInfo[currentStoreState.order[0].id] ? currentStoreState?.order?.map((x, i) => {
                                const product = productsInfo[x.id]
                                return <OrderItem
                                    key={i + product?.name}
                                    productId={x.id}
                                    title={product?.name}
                                    desc={product?.price + ' ₽'}
                                    image={product?.image}
                                    storeId={product?.store.id.toString()}
                                    count={x.quantity}
                                    category='food'
                                />
                            }) : <Loader color='gray' style={{ margin: '24px auto' }} size={24} />
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
                        <Select
                            label='Номер проживания'
                            mb={'md'}
                            size='md'
                            radius={'md'}
                            comboboxProps={{ withinPortal: true }}
                            data={rooms}
                            placeholder="Комната"
                            searchable
                            onChange={value => setRoom(() => ({
                                value: value,
                                label: rooms.find(x => x.value === value)?.label,
                                error: '',
                            }))}
                            error={room.error}
                        />

                        <InputBase
                            label='Номер для связи'
                            component={IMaskInput}
                            mask="+7 (000) 000-00-00"
                            placeholder="Ваш номер"
                            size='md'
                            radius='md'
                            onInput={e => {
                                // @ts-ignore
                                let value = e.target.value as string
                                if (value[4] === '8') {
                                    value = '+7'
                                }
                                let nv = formatNumber(value)
                                setOrderPhone(p => ({ error: '', value: nv }))
                            }}
                            defaultValue={formatNumber(orderPhone.value)}
                            disabled={currentStoreState?.order.length === 0}
                            error={orderPhone.error}
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
                            disabled={currentStoreState?.order.length === 0}
                        />

                        <Textarea
                            size="md"
                            radius="md"
                            label="Комментарий к заказу"
                            placeholder='Ваш комментарий'
                            // @ts-ignore
                            onInput={(v) => setOrderComment(v.target.value)}
                            disabled={currentStoreState?.order.length === 0}
                        />

                        <div className='order-score'>
                            <div className='order-score__amount'>
                                <span className='order-score__title'>Сумма заказа</span>
                                <span className='order-score__sum'>{total > 0 ? `${total} ₽` : 'Бесплатно'}</span>
                            </div>
                            <div
                                className='order-score__button'
                                onClick={isAuthenticated ? () => handleCheckout() : () => openAuthModal()}
                                style={currentStoreState?.order.length === 0 ? {
                                    pointerEvents: 'none',
                                    background: '#aaa'
                                } : {}}
                            >
                                <ReactSVG src='/svg/cart-white.svg' />
                                {isAuthenticated ? 'Оформить заказ' : 'Войти и оформить заказ'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </main>
        <NavBar page='services' />
    </>)
}