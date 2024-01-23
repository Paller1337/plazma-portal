import { IOrderInfo, IServiceOrder } from 'types/order'
import Button from './Button'
import { IServiceOrdered } from 'types/services'
import { useEffect, useMemo, useState } from 'react'
import { DEFAULTS } from 'defaults'
import { DateTime, Settings } from 'luxon'
import { Flex } from '@mantine/core'

interface OrderListItemProps {
    order?: IServiceOrder
}



const OrderLine = (props: { order: IServiceOrdered }) => {
    return (
        <div className='guest-order__part'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={DEFAULTS.STRAPI.url + props.order.service.attributes.images.data[0].attributes.url} alt='Халат'
                className='guest-order__image' />
            <span className='guest-order__item'>{props.order.service.attributes.title}</span>
            <div className='guest-order__part-amount'>
                <span className='guest-order__part-quantity'>{props.order.quantity} x</span>
                <span className='guest-order__part-price'>{props.order.service.attributes.price} ₽</span>
            </div>
        </div>
    )
}
export default function OrderListItem(props: OrderListItemProps) {
    const [statusStyle, setStatusStyle] = useState({
        '--status-color': '#000'
    } as React.CSSProperties)

    const status = useMemo(() => {
        switch (props.order.orderInfo.status) {
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
    }, [props.order.orderInfo.status]);

    useEffect(() => {
        setStatusStyle({
            '--status-color': status.color
        } as React.CSSProperties);
    }, [status])

    Settings.defaultLocale = 'ru';
    const createAt = DateTime.fromISO(props.order.orderInfo.createAt).toFormat('dd MMMM, HH:mm');

    return (
        <div className='guest-order'>
            <div className='guest-order__header'>
                <span className='guest-order__date'>{createAt}</span>
                <span className='guest-order__status guest-order__status--active' style={statusStyle}>{status.text}</span>
            </div>


            <div className='guest-order__info'>
                <span className='guest-order__number'>№ {props.order.id}</span>
                <span className='guest-order__type'>Тип заказа: Услуги</span>
            </div>

            <div className='guest-order__services'>
                {props.order.order.map((x, i) => (
                    <OrderLine key={x.service.id + DateTime.now().toISO()} order={x} />
                ))}
            </div>

            <div className='guest-order__total'>

                <div className='guest-order__total-row'>
                    <span className='guest-order__total-label'>Способ оплаты</span>
                    <span className='guest-order__total-amount'>{props.order.orderInfo.paymentType === 'bank-card' ? 'Банковская карта' : 'Наличные'}</span>
                </div>
                <div className='guest-order__total-row'>
                    <span className='guest-order__total-label'>Итого</span>
                    <span className='guest-order__total-amount'>{props.order.order.reduce((val, x) => val + x.quantity * x.service.attributes.price, 0)} ₽</span>
                </div>
            </div>

            <div className='guest-order__buttons'>
                <Button text='Повторить заказ' stretch />
            </div>
        </div>
    )
}