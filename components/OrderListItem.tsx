import { IOrder, IProduct, TOrderStatus } from 'types/order'
import Button from './Button'
import { IServiceOrdered } from 'types/services'
import { useEffect, useMemo, useState } from 'react'
import { DEFAULTS } from 'defaults'
import { DateTime, Settings } from 'luxon'
import { Divider, Flex, Group, Loader, LoadingOverlay, Paper, Stack, Text } from '@mantine/core'
import { useCart } from 'context/CartContext'
import Router, { useRouter } from 'next/router'
import { findItemInCache, findItemInNomenclature, getProductById } from 'helpers/cartContext'
import { ItemMenuV2, Product } from 'helpers/iiko/IikoApi/types'
import { getPaymentStatus, getPaymentType } from 'helpers/getPaymentType'
import { FaCheck, FaRotate } from 'react-icons/fa6'
import { FaClock } from 'react-icons/fa'
import { RiErrorWarningLine } from 'react-icons/ri'

interface OrderListItemProps {
    order?: IOrder
    orderStatus?: TOrderStatus
}



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

export default function OrderListItem(props: OrderListItemProps) {
    const [visibleLoadingOverlay, setVisibleLoadingOverlay] = useState(false)
    const [orderProducts, setOrderProducts] = useState<IProduct[]>(null)
    const { dispatch, productsInfo, menuCache, iikoMenuIsFetched, nomenclature } = useCart()
    const router = useRouter()

    const [statusStyle, setStatusStyle] = useState({
        '--status-color': '#000'
    } as React.CSSProperties)

    const status = useMemo(() => {
        switch (props.orderStatus) {
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
    }, [props.orderStatus]);

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
    // useEffect(() => console.log(props.order), [props.order])
    return (
        <div className='guest-order__wrapper' id={props.order.id.toString()}>
            <div className='guest-order'>
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


                <div className='guest-order__info'>
                    <span className='guest-order__number'>№ {props.order.id}</span>
                    <span className='guest-order__type'>Тип заказа: {props.order?.type?.label}</span>
                </div>

                <div className='guest-order__services'>
                    {props.order?.type?.value === 'eat' ?
                        iikoMenuIsFetched ? props.order.iikoProducts.map((x, i) => {
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
                        <span className='guest-order__total-amount'>{getPaymentType({ order: props.order, type: 'default' })}</span>
                    </div>
                    <div className='guest-order__total-row'>
                        <span className='guest-order__total-label'>Итого</span>
                        <span className='guest-order__total-amount'>
                            {props.order?.type?.value === 'eat' ?
                                iikoMenuIsFetched ? props.order.iikoProducts.reduce((val, x) => {
                                    const product = findItemInCache(x.product, menuCache)
                                    const sum = val + (x.quantity * product.itemSizes[0]?.prices[0]?.price * (x.stoplist ? 0 : 1))
                                    return sum
                                }, 0) : <Loader color='gray' style={{ margin: '0 auto' }} size={24} />
                                : orderProducts ? props.order.products.reduce(
                                    (val, x) => val + x.quantity * (orderProducts?.find(p => x.id === parseInt(p.id)) as IProduct).price, 0
                                ) : <Loader color='gray' style={{ margin: '0 auto' }} size={12} />} ₽

                        </span>
                    </div>
                </div>

                <div
                    className='guest-order__buttons'
                >
                    <Stack gap={8}>
                        {!props.order?.paid_for
                            && props.order?.paymentType === 'external'
                            && props.order?.status !== 'canceled'
                            &&
                            <Button text='Оплатить' stretch bgColor='#56754B'
                                onClick={() => router.push(`/basket/history/${props.order?.id}`, null, { shallow: true })}
                            />
                        }
                        <Button text='Повторить заказ' stretch
                            onClick={() => orderServiceRepeat()}
                        />
                    </Stack>
                </div>
            </div>
        </div>
    )
}