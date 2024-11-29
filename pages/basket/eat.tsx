import NavBar from '@/components/NavBar'
import { ReactSVG } from 'react-svg'
import Image from 'next/image'
import OrderItem from '@/components/OrderItem'
import { useCart } from 'context/CartContext'
import Router, { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from 'context/AuthContext'
import { DateTime } from 'luxon'
import { decodeToken } from 'helpers/login'
import { getGuestAccountByBookingId, getGuestAccountById } from 'helpers/session/guestAccount'
import OrderSendModal from '@/components/OrderSendModal'
import { GetServerSideProps } from 'next'
import { withAuthServerSideProps } from 'helpers/withAuthServerSideProps'
import { axiosInstance } from 'helpers/axiosInstance'
import Cookies from 'js-cookie'
import { Button, Group, Text, InputBase, Loader, LoadingOverlay, Paper, Select, Stack, Textarea } from '@mantine/core'
import { IMaskInput } from 'react-imask'
import { IGuestAccount } from 'types/session'
import Link from 'next/link'
import { telegramSendOrder } from 'helpers/telegram'
import { getOrdersByGuestId } from 'helpers/order/order'
import { findItemInCache, findItemInNomenclature } from 'helpers/cartContext'
import { RiErrorWarningLine } from 'react-icons/ri'
import { notify } from 'utils/notify'
import { FaCheckCircle } from 'react-icons/fa'
import { getStoreResult } from 'helpers/getStoreResult'
import { getStoreStatus, IStoreStatus } from 'utils/storeStatus'
import { metrika } from 'utils/metrika'
import { IStore } from 'pages/store/[id]'
import { FaFile, FaGear, FaPencil } from 'react-icons/fa6'
import { usePortal } from 'context/PortalContext'
import { DEFAULTS } from 'defaults'


export const getServerSideProps: GetServerSideProps = withAuthServerSideProps(async (context) => {
    const id = 'eat'

    const storeData = (await axiosInstance.get(`/api/store/custom/eat`)).data
    const data = storeData.data?.length > 0 ? storeData.data[0] : null
    const store = getStoreResult(data)

    const storeStatus = getStoreStatus(store.storeWorktime)
    // TODO Блокировка заказа в зависимости от времени работы
    try {

        return {
            props: {
                id: id,
                store,
                storeStatus
            }
        }
    } catch (error) {
        console.error('Ошибка ...:', error)
        return {
            props: {}
        }
    }
})

const DEFAULT_PAYMENT_TYPES = [
    { value: 'cash', label: 'Наличные' },
    { value: 'bank-card', label: 'Банковская карта' },
]

export default function OrderServices(props) {
    const storeStatus = props?.storeStatus as IStoreStatus
    const store = props?.store as IStore

    const [paymentTypes, setPaymentTypes] = useState(DEFAULT_PAYMENT_TYPES)
    const { yookassa } = usePortal()

    const { isAuthenticated, openAuthModal, currentUser } = useAuth()
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const { state, dispatch, productsInfo, storesInfo, hotelRooms, menuCache, iikoMenuIsFetched, nomenclature } = useCart()
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

    const rooms = hotelRooms?.map(room => ({
        value: room.id.toString(),
        label: room.tags
    }))

    const [guestAccount, setGuestAccount] = useState<{
        id: number,
        attributes: IGuestAccount
    }>(null)

    const [orderComment, setOrderComment] = useState('')
    const [orderPayment, setOrderPayment] = useState('bank-card')




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
        // console.log('state.stores[props.id]: ', state)
        // state.stores[props.id]
        console.log('currentStoreState: ', props)
    }, [])

    useEffect(() => {
        if (store?.payment_system) {
            setPaymentTypes(p => [...DEFAULT_PAYMENT_TYPES, { label: store?.payment_system?.title, value: store?.payment_system?.name }])
        }
    }, [store])
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
        if (!currentUser.approved) {
            notify({
                icon: <RiErrorWarningLine />,
                title: 'Заказ не оформлен.',
                message: 'Ваш аккаунт заблокирован. Вы не можете оформлять заказы.',
            })
            return
        }
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

            const serviceOrder = currentStoreState.order.map(item => {

                const product = findItemInCache(item.id, menuCache)
                return ({
                    id: item.id,
                    quantity: item.quantity,
                    price: product?.itemSizes[0].prices[0].price,
                    name: product?.name,
                })
            })

            const nowTime = DateTime.now().toISO()


            if (serviceOrder.length === 0) {
                notify({
                    icon: <RiErrorWarningLine />,
                    title: 'Ваша корзина пуста.',
                    message: 'Перед оформлением необходимо добавить товары в корзину.',
                })
                return
            }
            try {
                console.log({
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
                    products: [],
                    iikoProducts: currentStoreState.order.map(p => {
                        const product = findItemInCache(p.id, menuCache)
                        return ({
                            product: p.id,
                            quantity: p.quantity,
                            price: product?.itemSizes[0]?.prices[0]?.price || -1,
                        })
                    }) || [],
                    type: storesInfo[props.id]?.store_type.id,
                    store: storesInfo[props.id]?.id,
                })

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
                    products: [],
                    iikoProducts: currentStoreState.order.map(p => {
                        const product = findItemInCache(p.id, menuCache)
                        return ({
                            product: p.id,
                            quantity: p.quantity,
                            price: product?.itemSizes[0]?.prices[0]?.price || -1,
                        })
                    }) || [],
                    type: storesInfo[props.id]?.store_type.id,
                    store: storesInfo[props.id]?.id,
                })

                if (!orderIsPlace.status) return
                const orders = await getOrdersByGuestId(currentUser.id)
                const targetOrder = orders.find(o => o.id === orderIsPlace.data.data.id)

                // const response = await telegramSendOrder(targetOrder)ы
                // console.log('tg response: ', response)
                if (
                    // response &&
                    orderIsPlace
                ) {
                    // notify({
                    //     icon: <FaCheckCircle />,
                    //     title: 'Заказ оформлен!',
                    //     message: 'Спасибо за заказ.',
                    // })

                    metrika.eatOrder()
                    setOrderComment('')
                    dispatch({ type: 'CLEAR_CART', storeId: props.id })
                    if (targetOrder.paymentType === 'yookassa') {
                        handlePayment({ orderId: targetOrder.id })
                    } else {
                        router.push(`/basket/${Object.keys(storesInfo).find(x => x != props.id) || 0}`)
                        setModalIsOpen(true)
                    }
                    setVisibleLoadingOverlay(false)

                }


            } catch (error) {
                notify({
                    icon: <RiErrorWarningLine />,
                    title: 'Заказ не оформлен.',
                    message: 'Ошибка при оформлении заявки.',
                })
            }
        }
    }

    const closeModal = () => {
        console.log('state.stores: ', state.stores)
        if (Object.keys(state.stores).length === 0) router.push('/', null, { shallow: true })
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









    const handlePayment = async ({ orderId, }) => {
        if (!yookassa?.yooWidgetIsLoaded) {
            alert('Виджет еще не загружен. Попробуйте позже.');
            return;
        }

        try {
            const paymentResponse = await axiosInstance.post('/api/order/create-payment', {
                orderId,
                guestId: currentUser.id,
                amount: 1,
                phone: orderPhone.value,
                description: 'Оплата заказа еды',
                items: currentStoreState.order.map(p => {
                    const product = findItemInNomenclature(p.id, nomenclature)
                    return ({
                        name: product.seoTitle || product.name,
                        quantity: p.quantity,
                        price: product.sizePrices[0].price.currentPrice,
                    })
                }) || [],
            });

            console.log({ paymentResponse })
            const token = paymentResponse.data.payment.confirmation.confirmation_token;

            // Инициализация и отображение виджета
            await yookassa.initializeWidget(
                token,
                `${DEFAULTS.GENERAL_URL.app}/basket/history/${orderId}`,
            );
        } catch (error) {
            console.error('Ошибка при создании платежа:', error);
            alert('Ошибка при создании платежа. Попробуйте позже.');
        }
    };

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
                            if (x === 'eat') return (
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
                            iikoMenuIsFetched ? currentStoreState?.order?.map((x, i) => {
                                const product = findItemInCache(x.id, menuCache)
                                return <OrderItem
                                    key={i + product?.name}
                                    productId={x.id}
                                    title={product?.name}
                                    desc={`${x.quantity} x ${product?.itemSizes[0].prices[0].price}  ₽`}
                                    image={product?.itemSizes[0].buttonImageUrl}
                                    storeId={props.id}
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
                            data={paymentTypes}
                            onChange={(v) => setOrderPayment(v)}
                            // defaultValue={orderPayment}
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
                        {!props.storeStatus?.isOpen ?
                            <Stack align='flex-end'>
                                {storeStatus?.untilClose_min && storeStatus?.untilClose_min < 45 ?
                                    <Paper mt={8} px={12} py={4} radius={'lg'} bg={'orange'} w={'fit-content'}>
                                        <Text fw={600} fz={14} c={'white'}>До закрытия {storeStatus?.untilClose}</Text>
                                    </Paper>
                                    : <></>
                                }
                                {storeStatus?.untilOpen_min ?
                                    <Paper mt={8} px={12} py={4} bg={'green'} radius={'lg'} w={'fit-content'}>
                                        <Text fw={600} fz={14} c={'white'}>До открытия {storeStatus?.untilOpen}</Text>
                                    </Paper>
                                    : <></>
                                }
                            </Stack>
                            : <></>}

                        <div className='order-score'>
                            <div className='order-score__amount'>
                                <span className='order-score__title'>Сумма заказа</span>
                                <span className='order-score__sum'>{total > 0 ? `${total} ₽` : 'Бесплатно'}</span>
                            </div>
                            <Button
                                bg={currentStoreState?.order.length === 0
                                    || !storeStatus?.isOpen
                                    || props.settings?.isDisableOrders
                                    || (orderPayment === 'yookassa' && !yookassa?.yooWidgetIsLoaded)
                                    ? '#aaa'
                                    : '#56754B'
                                }
                                p={12} variant='filled'
                                c={'white'}
                                size='sm' h={'fit-content'} radius={'md'}
                                onClick={isAuthenticated ? () => handleCheckout() : () => openAuthModal()}
                                disabled={
                                    currentStoreState?.order.length === 0
                                    || !storeStatus?.isOpen
                                    || props.settings?.isDisableOrders
                                    || (orderPayment === 'yookassa' && !yookassa?.yooWidgetIsLoaded)
                                }
                            >
                                <Group gap={12}>
                                    <ReactSVG src='/svg/cart-white.svg' />
                                    {props.settings?.isDisableOrders ? 'Заказы приостановлены' : !storeStatus?.isOpen ? 'Магазин закрыт' : isAuthenticated ? 'Оформить заказ' : 'Войти и заказать'}
                                </Group>
                            </Button>
                            {/* <div
                                className={`order-score__button`}
                                onClick={isAuthenticated ? () => handleCheckout() : () => openAuthModal()}
                                style={currentStoreState?.order.length === 0 ? {
                                    pointerEvents: 'none',
                                    background: '#aaa'
                                } : {}}
                            >
                                <ReactSVG src='/svg/cart-white.svg' />
                                {isAuthenticated ? 'Оформить заказ' : 'Войти и оформить заказ'}
                            </div> */}
                        </div>
                        {/* {yookassa?.yooWidgetIsLoaded ?
                            <Button
                                bg={currentStoreState?.order.length === 0 || !storeStatus?.isOpen || props.settings?.isDisableOrders
                                    ? '#aaa' : '#56754B'}
                                p={12} variant='filled'
                                c={'white'}
                                size='sm' h={'fit-content'} radius={'md'}
                                onClick={handlePayment}
                            >
                                <Group gap={12}>
                                    <ReactSVG src='/svg/cart-white.svg' />
                                    Тестовый платеж
                                </Group>
                            </Button>
                            : <></>} */}

                        {store?.payment_system && store?.payment_system?.requisites ?

                            <Paper radius={'md'} p={12} style={{ border: '1px solid rgb(86, 117, 75)' }} mt={24}>
                                <Group wrap='nowrap'>
                                    <Stack
                                        bg={'rgb(86, 117, 75)'}
                                        p={8}
                                        style={{ borderRadius: 32 }}
                                        justify='center'
                                        align='center'
                                    >
                                        <FaPencil size={16} color='white' />
                                    </Stack>
                                    <Stack gap={2}>
                                        <Text fz={14} fw={500}>Реквизиты</Text>
                                        <Text fz={16}>{store?.payment_system?.requisites}</Text>
                                    </Stack>
                                </Group>
                            </Paper>
                            : <></>}
                    </div>
                </div>
            </div>


        </main>
        <NavBar page='services' />
    </>)
}