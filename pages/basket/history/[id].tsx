import NavBar from '@/components/NavBar'
import Router, { useRouter } from 'next/router'
import OrderListItem from '@/components/OrderListItem'
// import { IServiceOrder } from 'types/order'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { GetServerSideProps } from 'next'
import { SECRET_KEY } from 'helpers/login'
import HeaderUnder from '@/components/HeaderUndex'
import { withAuthServerSideProps } from 'helpers/withAuthServerSideProps'
// import { useOrders } from 'context/OrderContext'
import { getOrdersByGuestId } from 'helpers/order/order'
import { IOrder, IProduct } from 'types/order'
import { useOrders } from 'context/OrderContext'
import { DEFAULTS } from 'defaults'
import { useEffect, useMemo, useState } from 'react'
import { useCart } from 'context/CartContext'
import { ItemMenuV2, Product } from 'helpers/iiko/IikoApi/types'
import { DateTime, Settings } from 'luxon'
import { findItemInCache, findItemInNomenclature, getProductById } from 'helpers/cartContext'
import { Button, Divider, Group, Loader, LoadingOverlay, Paper, Progress, Stack, Text } from '@mantine/core'
import { getPaymentStatus, getPaymentType } from 'helpers/getPaymentType'
import { FaCheck, FaCircleXmark, FaNotEqual, FaPhone, FaRecycle, FaRotate, FaTimeline, FaXmark } from 'react-icons/fa6'
import { FaClock, FaTimesCircle } from 'react-icons/fa'
import { axiosInstance } from 'helpers/axiosInstance'
import { IYookassaContext, usePortal } from 'context/PortalContext'
import { IPortalSettings } from 'helpers/getPortalSettings'
import { IPaymentData } from '@/components/admin/ServiceOrder'
import { ReactSVG } from 'react-svg'
import { RiErrorWarningLine } from 'react-icons/ri'
import { notify } from 'utils/notify'
import { useInterval } from '@mantine/hooks'




interface BasketHistoryProps {
    order?: IOrder
}

export const getServerSideProps: GetServerSideProps = withAuthServerSideProps(async (context) => {
    const { id } = context.params
    try {
        const token = context.req.headers.cookie?.split('; ').find(c => c.startsWith('session_token='))?.split('=')[1];
        if (!token) {
            // Обрабатываем случай, когда токен отсуствует
            return { props: {} };
        }
        const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload

        // console.log('decoded: ', decoded)

        const orders = await getOrdersByGuestId(decoded.accountId)
        const order = orders.find(ord => ord.id === parseInt((id as string)))


        if (!orders) {
            throw new Error(`Заказов нет`);
        }

        // const orders: IServiceOrder[] = servicesFromRes(res)

        return {
            props: {
                order: order,
            } as BasketHistoryProps
        }
    } catch (error) {
        console.error('Ошибка при получении услуг:', error)
        return {
            props: {
                order: null
            } as BasketHistoryProps
        }
    }
})



const OrderLine = (props: { product: IProduct, quantity: number }) => {
    // console.log('order line: ', props.product)
    return (
        <div className='guest-order__part'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={DEFAULTS.STRAPI.url + props.product?.image} alt=''
                className='guest-order__image' />
            <span className='guest-order__item'>{props.product?.name}</span>
            <div className='guest-order__part-amount'>
                <span className='guest-order__part-quantity'>{props.quantity} x</span>
                <span className='guest-order__part-price'>{props.product?.price} ₽</span>
            </div>
        </div>
    )
}

const IikoOrderLine = (props: { product: ItemMenuV2, productNomen: Product, quantity: number, stoplist: boolean }) => {
    // console.log('order line: ', props.product)
    return (
        <div className='guest-order__part' style={{ position: 'relative' }}>
            {props.stoplist ? <Divider
                pos={'absolute'}
                left={0}
                right={0}
                top={'50%'}
                style={{
                    transform: 'translateY(-50%)',
                }}
                bg={'#f23'}
            /> : <></>}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={props.product?.itemSizes[0]?.buttonImageUrl || '/images/no-photo-60x60.png'} alt=''
                className='guest-order__image' />
            <span className='guest-order__item'>{props.productNomen?.name}</span>
            <div className='guest-order__part-amount'>
                <span className='guest-order__part-quantity'>{props.quantity} x</span>
                <span className='guest-order__part-price'>{props.product?.itemSizes[0]?.prices[0]?.price} ₽</span>
            </div>
        </div>
    )
}


export default function OrderServices(props: BasketHistoryProps) {
    const { state, ws } = useOrders()
    const { portalSettings, yookassa } = usePortal()

    const order = state.orders?.find(ord => parseInt(ord.id) === props.order?.id)
    const paidStatus = order === null ? props.order.paid_for : order?.paid_for
    // console.log({paidStatus})
    // @ts-ignore
    const [visibleLoadingOverlay, setVisibleLoadingOverlay] = useState(false)
    const [orderProducts, setOrderProducts] = useState<IProduct[]>(null)
    const { dispatch, productsInfo, menuCache, iikoMenuIsFetched, nomenclature } = useCart()
    const [paymentData, setPaymentData] = useState<IPaymentData[] | undefined>(undefined)
    const [paymentDataIsFetched, setPaymentDataIsFetched] = useState<boolean>(false)
    const targetPayment = paymentData?.length > 0 ? paymentData[0] : null
    const paymentStatusFetching = useInterval(async () => await fetchPayment(), 8000)

    const fetchPayment = async () => {
        if (order?.paid_for) return
        const payment = await axiosInstance.post(`/api/order/payments/${props.order.id}`).finally(() => setPaymentDataIsFetched(true))
        if (portalSettings?.debug) console.log(`Payment for order ${props.order.id}:`, { payment: payment.data })
        setPaymentData(payment.data)
    }

    // const paymentStatus = order === null ? props.order.paid_for : order?.paid_for
    const [statusStyle, setStatusStyle] = useState({
        '--status-color': '#000'
    } as React.CSSProperties)

    const status = useMemo(() => {
        switch (state.orders?.find(ord => parseInt(ord.id) === props.order?.id)?.status) {
            case 'new':
                return {
                    text: 'Новый',
                    color: '#228be6'
                };
            case 'inwork':
                return {
                    text: 'В работе',
                    color: '#fd7e14'
                };
            case 'delivered':
                return {
                    text: 'Доставляется',
                    color: '#40c057'
                };

            case 'canceled':
                return {
                    text: 'Отменен',
                    color: '#F23',
                }

            case 'done':
                return {
                    text: 'Готов',
                    color: '#868e96',
                };
            default:
                return {
                    text: 'Не определен',
                    color: '#000'
                };
        }
    }, [state.orders]);

    useEffect(() => {
        setStatusStyle({
            '--status-color': status.color
        } as React.CSSProperties);
    }, [status])

    useEffect(() => {
        if (props.order) {
            const initProducts = async () => {
                const products = []
                for (const product of props.order?.products) {
                    const fetchedProduct = await getProductById(product.id) as IProduct
                    products.push(fetchedProduct)
                }
                setOrderProducts(products)
            }
            initProducts()
        }
    }, [props.order, props.order?.products])

    // useEffect(() => {
    //     if (ws.current?.connected) {
    //         const socket = ws.current;

    //         const handlePaymentChange = (data) => {
    //             console.log('[TRIGGER] handlePaymentChange', data);

    //         };

    //         // Удаляем старую подписку перед добавлением новой
    //         socket.off(`paymentChange-${props.order.id}`, handlePaymentChange);
    //         socket.on(`paymentChange-${props.order.id}`, handlePaymentChange);

    //         // Чистим обработчик при размонтировании
    //         return () => {
    //             socket.off(`paymentChange-${props.order.id}`, handlePaymentChange);
    //         };
    //     }
    // }, [ws.current]);
    const handleConsole = () => {
        console.log({ ws })
        console.log({ state })
    }


    Settings.defaultLocale = 'ru';
    const createAt = DateTime.fromISO(props.order?.create_at).toFormat('dd MMMM, HH:mm');

    const total = props.order?.type?.value === 'eat' ?
        iikoMenuIsFetched && state.orders?.find(o => Number(o.id) === Number(props.order?.id))?.iikoProducts?.filter(p => !p.stoplist).reduce((val, x) => {
            const product = findItemInCache(x.product, menuCache)
            const sum = val + x.quantity * product.itemSizes[0]?.prices[0]?.price
            return sum
        }, 0)
        : orderProducts && props.order?.products.reduce(
            (val, x) => val + x.quantity * (orderProducts?.find(p => x.id === parseInt(p.id)) as IProduct).price, 0
        )


    const retryPayment = async () => {
        // const paymentCapture = await axiosInstance.post(`/api/order/payments/${order.id}/cancel`, {
        //     paymentId: targetPayment.payment_id
        // })
        handleExternalPayment(props.order)
    }
    const handleExternalPayment = async (targetOrder: IOrder) => {
        if (portalSettings?.debug) console.log({ targetOrder, portalSettings, yookassa })
        switch (targetOrder.payment_system.name) {
            case 'yookassa':
                await handleYookassa(targetOrder, portalSettings, yookassa)
                break;
            case 'yookassa_test':
                await handleYookassa(targetOrder, portalSettings, yookassa)
                break;
            default:
                return
        }
    }


    const handleYookassa = async (order: IOrder, globalSettings: IPortalSettings, yookassa: IYookassaContext) => {
        if (!yookassa?.yooWidgetIsLoaded) {
            alert('Виджет еще не загружен. Попробуйте позже.');
            return;
        }
        const payment_system_description = 'Оплата заказа еды'
        if (!order?.payment_system?.id) {
            alert('Онлайн оплата временно не работает.');
            return;
        }
        try {
            const paymentResponse = await axiosInstance.post('/api/order/payments', {
                payment_system: order?.payment_system?.id,
                orderId: order?.id,
                guestId: order?.guest?.id,
                amount: total,
                phone: order?.guest?.phone,
                description: payment_system_description,
                items: order?.iikoProducts.map(p => {
                    const product = findItemInNomenclature(p.product, nomenclature)
                    return ({
                        name: product.seoTitle || product.name,
                        quantity: p.quantity,
                        price: product.sizePrices[0].price.currentPrice,
                    })
                }) || [],
            });

            if (globalSettings?.debug) console.log({ paymentResponse })
            const token = paymentResponse.data.payment.confirmation.confirmation_token;

            // Инициализация и отображение виджета
            await yookassa.initializeWidget(
                token,
                `${DEFAULTS.GENERAL_URL.app}/basket/history/${order?.id}`,
            );
        } catch (error) {
            console.error('Ошибка при создании платежа:', error);
            alert('Ошибка при создании платежа. Попробуйте позже.');
        }
    };

    useEffect(() => {
        if (portalSettings && props.order.id && props.order.paymentType === 'external') {
            fetchPayment()
            paymentStatusFetching.start()
            return paymentStatusFetching.stop
        }
    }, [props.order, portalSettings])

    // useEffect(() => console.log('history props.order ', props.order), [props.order])

    const orderTotal = total + (props.order.store?.fee
        ? props.order.store?.fee.type === 'fix' ? props.order.store?.fee.value : total * props.order.store.fee.value / 100 : 0)


    return (<>
        <HeaderUnder title={props.order ? 'Заказ №' + props.order?.id : 'Заказ не найден'} onClick={() => Router.back()} />
        <main className='--gray-main'>
            <div className='page-wrapper'>
                <div className='order-list'>
                    {props.order ?
                        <>
                            {/* <div className='guest-order__wrapper' id={props.order.id.toString()}> */}
                            {/* <div className='guest-order'> */}
                            <LoadingOverlay
                                visible={visibleLoadingOverlay}
                                zIndex={1000}
                                overlayProps={{ radius: 'sm', blur: 2 }}
                                loaderProps={{ color: 'gray', type: 'oval' }}
                            />

                            <div className='guest-order__header' onClick={handleConsole}>
                                <span className='guest-order__date'>{createAt}</span>
                                <span className='guest-order__status guest-order__status--active' style={statusStyle}>{status.text}</span>
                            </div>
                            {/* <Paper my={12} radius={'md'} p={12} style={{ border: '1px solid rgb(86, 117, 75)' }}>
                                {paidStatus
                                    ?
                                    <Group gap={12} wrap='nowrap'>
                                        <Stack
                                            bg={'rgb(86, 117, 75)'}
                                            p={6}
                                            style={{ borderRadius: 32 }}
                                            justify='center'
                                            align='center'
                                        >
                                            <FaCheck size={18} color='white' />
                                        </Stack>
                                        <Stack>
                                            <Text fz={15} fw={600}>Заказ оплачен</Text>
                                        </Stack>
                                    </Group>
                                    :
                                    <Group gap={12} wrap='nowrap'>
                                        <Stack
                                            bg={'rgb(86, 117, 75)'}
                                            p={6}
                                            style={{ borderRadius: 32 }}
                                            justify='center'
                                            align='center'
                                        >
                                            <FaClock size={18} color='white' />
                                        </Stack>
                                        <Stack w='100%' gap={4}>
                                            <Text fz={15} fw={600}>Заказ ожидает оплаты</Text>
                                            <Progress color="rgb(86, 117, 75)" value={100} striped animated />
                                        </Stack>

                                    </Group>
                                }
                            </Paper> */}

                            <Stack gap={8} my={12}>
                                {props.order?.paymentType === 'external'
                                    ?
                                    <Paper radius={'md'} p={12} style={{ border: '1px solid rgb(86, 117, 75)' }}>
                                        {paymentDataIsFetched ? targetPayment ?
                                            <Group gap={12} wrap='nowrap'>
                                                <Stack
                                                    bg={'rgb(86, 117, 75)'}
                                                    p={6}
                                                    style={{ borderRadius: 32 }}
                                                    justify='center'
                                                    align='center'
                                                >
                                                    {order?.paid_for ? <FaCheck size={18} color='white' /> :
                                                        targetPayment?.status === 'waiting_for_capture' || targetPayment?.status === 'pending' ?
                                                            <FaClock size={18} color='white' />
                                                            :
                                                            targetPayment?.status === 'canceled' ?
                                                                <RiErrorWarningLine size={18} color='white' />
                                                                :
                                                                <FaCheck size={18} color='white' />
                                                    }
                                                </Stack>

                                                <Group wrap='nowrap' justify='space-between' w={'100%'}>
                                                    <Text fz={15} fw={600}>
                                                        {order?.paid_for
                                                            ? 'Оплачен'
                                                            : getPaymentStatus({ status: targetPayment?.status }).guest
                                                        }
                                                    </Text>
                                                    {(targetPayment?.status === 'pending' || targetPayment?.status === 'waiting_for_capture') &&
                                                        <Progress w={100} size={'lg'} color="rgb(86, 117, 75)" value={100} striped animated />
                                                    }
                                                </Group>
                                                {targetPayment?.status === 'pending' || (targetPayment?.status === 'canceled' && order?.status !== 'canceled') ?
                                                    <Button
                                                        bg={'#56754B'}
                                                        ml={'auto'}
                                                        p={12} variant='filled'
                                                        c={'white'}
                                                        size='sm' h={'fit-content'} radius={'md'}
                                                        onClick={() => retryPayment()}
                                                    >
                                                        <Group gap={12} wrap='nowrap'>
                                                            {/* <ReactSVG src='/svg/cart-white.svg' /> */}
                                                            <FaRotate size={18} color='white' />
                                                            Повторить оплату
                                                        </Group>
                                                    </Button>
                                                    : <></>}
                                            </Group>
                                            :
                                            <Stack>
                                                <Group gap={12} wrap='nowrap'>
                                                    <Stack
                                                        bg={'rgb(86, 117, 75)'}
                                                        p={6}
                                                        style={{ borderRadius: 32 }}
                                                        justify='center'
                                                        align='center'
                                                    >
                                                        <FaXmark size={18} color='white' />
                                                    </Stack>
                                                    <Stack>
                                                        <Text fz={15} fw={600}>{getPaymentStatus({ status: targetPayment?.status }).guest}</Text>
                                                    </Stack>

                                                    <Button
                                                        bg={'#56754B'}
                                                        ml={'auto'}
                                                        p={12} variant='filled'
                                                        c={'white'}
                                                        size='sm' h={'fit-content'} radius={'md'}
                                                        onClick={() => handleExternalPayment(props.order)}
                                                    >
                                                        <Group gap={12}>
                                                            <ReactSVG src='/svg/cart-white.svg' />
                                                            Оплатить заказ
                                                        </Group>
                                                    </Button>
                                                </Group>
                                            </Stack>
                                            :
                                            <Stack>
                                                <Loader color='gray' style={{ margin: '0 auto' }} size={24} />
                                            </Stack>
                                        }

                                        {/* <Group gap={12} wrap='nowrap'>
                                        <Stack
                                            bg={'rgb(86, 117, 75)'}
                                            p={6}
                                            style={{ borderRadius: 32 }}
                                            justify='center'
                                            align='center'
                                        >
                                            <FaClock size={18} color='white' />
                                        </Stack>
                                        <Stack w='100%' gap={4}>
                                            <Text fz={15} fw={600}>Заказ ожидает оплаты</Text>
                                            <Progress color="rgb(86, 117, 75)" value={100} striped animated />
                                        </Stack>

                                    </Group> */}

                                    </Paper>
                                    : <></>
                                }

                                {(props.order?.paymentType === 'external' && targetPayment?.status === 'waiting_for_capture') &&
                                    <Paper radius={'md'} px={14} py={8} style={{ border: '1px solid rgb(86, 117, 75)' }}>
                                        <Stack>
                                            <Group gap={12} wrap='nowrap'>
                                                <Stack
                                                    bg={'rgb(86, 117, 75)'}
                                                    p={6}
                                                    style={{ borderRadius: 32 }}
                                                    justify='center'
                                                    align='center'
                                                >
                                                    <FaPhone size={18} color='white' />
                                                </Stack>
                                                <Stack>
                                                    <Text fz={15} fw={600}>С вами скоро свяжутся для подтверждения заказа</Text>
                                                </Stack>

                                            </Group>
                                        </Stack>
                                    </Paper>
                                }
                            </Stack>
                            <div className='guest-order__info'>
                                <span className='guest-order__number'>№ {props.order?.id}</span>
                                <span className='guest-order__type'>Тип заказа: {props.order?.type?.label}</span>
                            </div>

                            <div className='guest-order__services'>
                                {props.order?.type?.value === 'eat' ?
                                    iikoMenuIsFetched ? state.orders?.find(o => Number(o.id) === Number(props.order?.id))?.iikoProducts.map((x, i) => {
                                        const product = findItemInCache(x.product, menuCache)
                                        const productNomen = findItemInNomenclature(x.product, nomenclature)
                                        return (
                                            <IikoOrderLine
                                                key={x.product + DateTime.now().toISO()}
                                                product={product}
                                                productNomen={productNomen}
                                                quantity={x.quantity}
                                                stoplist={x.stoplist}
                                            />
                                        )
                                    }) : <Loader color='gray' style={{ margin: '0 auto' }} size={24} />
                                    : orderProducts ? state.orders?.find(o => Number(o.id) === Number(props.order?.id))?.products.map((x, i) => {
                                        return (
                                            <OrderLine
                                                key={x.id + DateTime.now().toISO()}
                                                product={orderProducts?.find(p => Number(x.id) === Number(p.id)) as IProduct}
                                                quantity={x.quantity}
                                            />
                                        )
                                    }) : <Loader color='gray' style={{ margin: '0 auto' }} size={24} />}
                            </div>

                            <div className='guest-order__total'>

                                <div className='guest-order__total-row'>
                                    <span className='guest-order__total-label'>Способ оплаты</span>
                                    <span className='guest-order__total-amount'>{getPaymentType({ order: props.order, type: 'default' })}</span>
                                </div>
                                {props.order.store.fee ?
                                    <>
                                        <div className='guest-order__total-row'>
                                            <span className='guest-order__total-label'>Сумма заказа</span>
                                            <span className='guest-order__total-amount'>
                                                {props.order?.type?.value === 'eat' ?
                                                    iikoMenuIsFetched ? total : <Loader color='gray' style={{ margin: '0 auto' }} size={24} />
                                                    : orderProducts ? props.order.products.reduce(
                                                        (val, x) => val + x.quantity * (orderProducts?.find(p => x.id === parseInt(p.id)) as IProduct).price, 0
                                                    ) : <Loader color='gray' style={{ margin: '0 auto' }} size={12} />} ₽

                                            </span>
                                        </div>
                                        <Group w={'100%'} justify='space-between'>
                                            <Text c={'#666'} fw={400}>{props.order.store.fee?.name}</Text>
                                            <Group wrap='nowrap' gap={4}>
                                                <Text c={'#252525'}>({props.order.store.fee?.value}{props.order.store.fee?.type === 'fix' ? ' ₽' : '%'})</Text>
                                                <Text c={'#252525'} fw={600}>{total * props.order.store.fee?.value / 100} ₽</Text>
                                            </Group>
                                        </Group>
                                    </>
                                    : <></>
                                }
                                <div className='guest-order__total-row'>
                                    <span className='guest-order__total-label'>Итого</span>
                                    <span className='guest-order__total-amount'>{orderTotal ?? 0} ₽</span>
                                </div>
                            </div>

                            {/* <div
                                    className='guest-order__buttons'
                                    onClick={() => orderServiceRepeat()}
                                >
                                    <Button text='Повторить заказ' stretch />
                                </div> */}
                            {/* </div> */}
                            {/* </div> */}
                        </>
                        :
                        <div className='order-list__nothing'>Такого заказа нет</div>
                    }

                    {/* <Button onClick={fetch} text='Fetch' /> */}
                </div>
            </div>
        </main>
        <NavBar page={'basket/history'} />
    </>)
}