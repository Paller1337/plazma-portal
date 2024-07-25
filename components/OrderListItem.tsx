import { IOrder, IProduct } from 'types/order'
import Button from './Button'
import { IServiceOrdered } from 'types/services'
import { useEffect, useMemo, useState } from 'react'
import { DEFAULTS } from 'defaults'
import { DateTime, Settings } from 'luxon'
import { Flex, Loader, LoadingOverlay } from '@mantine/core'
import { useCart } from 'context/CartContext'
import Router from 'next/router'
import { getProductById } from 'helpers/cartContext'

interface OrderListItemProps {
    order?: IOrder
}



const OrderLine = (props: { product: IProduct, quantity: number }) => {
    console.log('order line: ', props.product)
    return (
        <div className='guest-order__part'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={DEFAULTS.STRAPI.url + props.product?.image} alt='Халат'
                className='guest-order__image' />
            <span className='guest-order__item'>{props.product?.name}</span>
            <div className='guest-order__part-amount'>
                <span className='guest-order__part-quantity'>{props.quantity} x</span>
                <span className='guest-order__part-price'>{props.product?.price} ₽</span>
            </div>
        </div>
    )
}
export default function OrderListItem(props: OrderListItemProps) {
    const [visibleLoadingOverlay, setVisibleLoadingOverlay] = useState(false)
    const [orderProducts, setOrderProducts] = useState<IProduct[]>(null)
    const { dispatch, productsInfo } = useCart()
    const [statusStyle, setStatusStyle] = useState({
        '--status-color': '#000'
    } as React.CSSProperties)

    const status = useMemo(() => {
        switch (props.order.status) {
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
    }, [props.order.status]);

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
        Router.push(`/basket/${props.order.store.id}`)
    }

    return (
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
                <span className='guest-order__type'>Тип заказа: Услуги</span>
            </div>

            <div className='guest-order__services'>
                {orderProducts ? props.order.products.map((x, i) => {
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
                    <span className='guest-order__total-amount'>{props.order.paymentType === 'bank-card' ? 'Банковская карта' : 'Наличные'}</span>
                </div>
                <div className='guest-order__total-row'>
                    <span className='guest-order__total-label'>Итого</span>
                    <span className='guest-order__total-amount'>{
                        orderProducts ? props.order.products.reduce(
                            (val, x) => val + x.quantity * (orderProducts?.find(p => x.id === parseInt(p.id)) as IProduct).price, 0
                        ) : <Loader color='gray' style={{ margin: '0 auto' }} size={12} />} ₽
                    </span>
                </div>
            </div>

            <div
                className='guest-order__buttons'
                onClick={() => orderServiceRepeat()}
            >
                <Button text='Повторить заказ' stretch />
            </div>
        </div>
    )
}