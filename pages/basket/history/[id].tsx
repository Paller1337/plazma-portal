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
import { ItemMenuV2 } from 'helpers/iiko/IikoApi/types'
import { DateTime, Settings } from 'luxon'
import { findItemInCache, getProductById } from 'helpers/cartContext'
import { Group, Loader, LoadingOverlay, Paper, Progress, Stack, Text } from '@mantine/core'
import { getPaymentType } from 'helpers/getPaymentType'
import { FaCheck, FaTimeline } from 'react-icons/fa6'
import { FaClock, FaTimesCircle } from 'react-icons/fa'




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

        console.log('orders ', orders)

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

const IikoOrderLine = (props: { product: ItemMenuV2, quantity: number }) => {
    // console.log('order line: ', props.product)
    return (
        <div className='guest-order__part'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={props.product?.itemSizes[0]?.buttonImageUrl || '/images/no-photo-60x60.png'} alt=''
                className='guest-order__image' />
            <span className='guest-order__item'>{props.product?.name}</span>
            <div className='guest-order__part-amount'>
                <span className='guest-order__part-quantity'>{props.quantity} x</span>
                <span className='guest-order__part-price'>{props.product?.itemSizes[0]?.prices[0]?.price} ₽</span>
            </div>
        </div>
    )
}


export default function OrderServices(props: BasketHistoryProps) {
    const { state } = useOrders()
    const order = state.orders?.find(ord => parseInt(ord.id) === props.order?.id)
    const paidStatus = order === null ? props.order.paid_for : order?.paid_for
    // console.log({paidStatus})
    // @ts-ignore
    const [visibleLoadingOverlay, setVisibleLoadingOverlay] = useState(false)
    const [orderProducts, setOrderProducts] = useState<IProduct[]>(null)
    const { dispatch, productsInfo, menuCache, iikoMenuIsFetched } = useCart()

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
        const initProducts = async () => {
            const products = []
            for (const product of props.order.products) {
                const fetchedProduct = await getProductById(product.id) as IProduct
                products.push(fetchedProduct)
            }
            setOrderProducts(products)
        }
        initProducts()
    }, [props.order.products])

    Settings.defaultLocale = 'ru';
    const createAt = DateTime.fromISO(props.order.create_at).toFormat('dd MMMM, HH:mm');

    const orderServiceRepeat = () => {
        setVisibleLoadingOverlay(true)
        if (props.order.type.value === 'eat') {
            dispatch({ type: 'CLEAR_CART', storeId: 'eat' })
            for (let product of props.order.iikoProducts) {
                // console.log(`in ${service.service.id.toString()} amount ${service.quantity}`)
                dispatch({
                    type: 'ADD_ITEM',
                    storeId: 'eat',
                    item: {
                        id: product.product.toString(),
                        quantity: product.quantity
                    },
                })
            }
            Router.push(`/basket/eat`, null, { shallow: true })
        } else {
            dispatch({ type: 'CLEAR_CART', storeId: props.order.store.id.toString() })
            for (let product of props.order.products) {
                // console.log(`in ${service.service.id.toString()} amount ${service.quantity}`)
                dispatch({
                    type: 'ADD_ITEM',
                    storeId: props.order.store.id.toString(),
                    item: {
                        id: product.id.toString(),
                        quantity: product.quantity
                    },
                })
            }
            Router.push(`/basket/${props.order.store.id}`, null, { shallow: true })
        }
    }
    useEffect(() => console.log(props.order), [props.order])

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



                            <div className='guest-order__header'>
                                <span className='guest-order__date'>{createAt}</span>
                                <span className='guest-order__status guest-order__status--active' style={statusStyle}>{status.text}</span>
                            </div>
                            <Paper my={12} radius={'md'} p={12} style={{ border: '1px solid rgb(86, 117, 75)' }}>
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
                            </Paper>

                            <div className='guest-order__info'>
                                <span className='guest-order__number'>№ {props.order.id}</span>
                                <span className='guest-order__type'>Тип заказа: {props.order?.type?.label}</span>
                            </div>

                            <div className='guest-order__services'>
                                {props.order?.type?.value === 'eat' ?
                                    iikoMenuIsFetched ? props.order.iikoProducts.map((x, i) => {
                                        const product = findItemInCache(x.product, menuCache)
                                        return (
                                            <IikoOrderLine
                                                key={x.product + DateTime.now().toISO()}
                                                product={product}
                                                quantity={x.quantity}
                                            />
                                        )
                                    }) : <Loader color='gray' style={{ margin: '0 auto' }} size={24} />
                                    : orderProducts ? props.order.products.map((x, i) => {
                                        return (
                                            <OrderLine
                                                key={x.id + DateTime.now().toISO()}
                                                product={orderProducts?.find(p => x.id === parseInt(p.id)) as IProduct}
                                                quantity={x.quantity}
                                            />
                                        )
                                    }) : <Loader color='gray' style={{ margin: '0 auto' }} size={24} />}
                            </div>

                            <div className='guest-order__total'>

                                <div className='guest-order__total-row'>
                                    <span className='guest-order__total-label'>Способ оплаты</span>
                                    <span className='guest-order__total-amount'>{getPaymentType(props.order.paymentType)}</span>
                                </div>
                                <div className='guest-order__total-row'>
                                    <span className='guest-order__total-label'>Итого</span>
                                    <span className='guest-order__total-amount'>
                                        {props.order?.type?.value === 'eat' ?
                                            iikoMenuIsFetched ? props.order.iikoProducts.reduce((val, x) => {
                                                const product = findItemInCache(x.product, menuCache)
                                                const sum = val + x.quantity * product.itemSizes[0]?.prices[0]?.price
                                                return sum
                                            }, 0) : <Loader color='gray' style={{ margin: '0 auto' }} size={24} />
                                            : orderProducts ? props.order.products.reduce(
                                                (val, x) => val + x.quantity * (orderProducts?.find(p => x.id === parseInt(p.id)) as IProduct).price, 0
                                            ) : <Loader color='gray' style={{ margin: '0 auto' }} size={12} />} ₽

                                    </span>
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