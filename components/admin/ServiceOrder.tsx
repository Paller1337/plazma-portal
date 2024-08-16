import { Card, Image, Text, Group, Badge, Button, ActionIcon, Stack, Flex } from '@mantine/core'
import { DEFAULTS } from 'defaults';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react'
import { IOrder, IProduct, TOrderPaymentType, TOrderStatus } from 'types/order'
import { IServiceOrdered, TServiceOrderStatus } from 'types/services'
import AdminOrderModal from './OrderModal';

const mockdata = {
    image:
        'https://images.unsplash.com/photo-1437719417032-8595fd9e9dc6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80',
    title: 'Домик на набережной 3',
    customer: 'Анастасия Сычева',
    country: 'Croatia',
    description:
        'Completely renovated for the season 2020, Arena Verudela Bech Apartments are fully equipped and modernly furnished 4-star self-service apartments located on the Adriatic coastline by one of the most beautiful beaches in Pula.',
    badges: [
        { emoji: '☀️', label: 'Sunny weather' },
        { emoji: '🦓', label: 'Onsite zoo' },
        { emoji: '🌊', label: 'Sea' },
        { emoji: '🌲', label: 'Nature' },
        { emoji: '🤽', label: 'Water sports' },
    ],
};

export interface ICServiceOrderProps {
    order: IOrder
    products: IProduct[]
    isVisualNew?: boolean
}

interface ServiceOrderItemProps {
    image?: string
    name: string
    amount: number
}

export const ServiceOrderItem = (props: ServiceOrderItemProps) => {
    return (
        <div className='admin-serviceCard__orderItem'>
            <div className='admin-serviceCard__orderItem-product'>
                <div className='admin-serviceCard__orderItem-image' style={props.image ? { backgroundImage: `url(${props.image})` } : {}} />
                <div className='admin-serviceCard__orderItem-name'>{props.name}</div>
            </div>
            <div className='admin-serviceCard__orderItem-meta'>
                <span className='admin-serviceCard__orderItem-amount'>{props.amount} шт.</span>
            </div>
        </div>
    )
}

export const ServiceOrderBadge = (props: { status: TOrderStatus, id: number, date: string }) => {
    const checkOrderStatus = (status) => {
        // if (!props.status) return
        switch (props.status) {
            case 'new':
                return {
                    name: 'Новый',
                    color: 'blue',
                }
            // break;
            case 'delivered':
                return {
                    name: 'Доставляется',
                    color: 'green',
                }
            // break;

            case 'done':
                return {
                    name: 'Выполнен',
                    color: 'gray',
                }
            // break
            case 'inwork':
                return {
                    name: 'В работе',
                    color: 'orange',
                }
            // break
            default:
                return {
                    name: 'Не определен',
                    color: 'lime.4',
                }
            // break
        }
    }

    const badge = checkOrderStatus(props.status)
    const date = DateTime.fromISO(props.date).toLocaleString({ weekday: 'short', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })

    return (
        <Flex direction={'row'} justify={'space-between'}>
            <span className='admin-serviceCard__date'>{date}</span>
            <span className='admin-serviceCard__id'>ID:{props.id}</span>
            <Badge autoContrast variant="light" color={badge.color} className='admin-serviceCard__badge' >
                {badge.name}
            </Badge>
        </Flex>
    )
}

export default function ServiceOrder(props: ICServiceOrderProps) {
    const [modalIsOpen, setModalIsOpen] = useState(false)

    const openModal = (index) => {
        setModalIsOpen(true)
    }
    const paymentType = props.order.paymentType === 'bank-card' ? 'Банковская карта' : props.order.paymentType === 'cash' ? 'Наличные' : 'Не указан'


    // useEffect(() => {
    //     console.log('ServiceOrder: ', props.orderInfo.customer.name, ': ', props)
    // }, [props])
    return (<>
        <AdminOrderModal isOpen={modalIsOpen} onClose={() => setModalIsOpen(false)} order={props} />

        <div className='admin-serviceCard__outer'>
            <div className={`admin-serviceCard${props.isVisualNew ? ' admin-serviceCard_new' : ''}`} onClick={() => openModal(props.order.id)}>
                <ServiceOrderBadge status={props.order.status} id={props.order.id} date={props.order.create_at} />

                <div className='admin-serviceCard__header'>
                    <div className='admin-serviceCard__status'>
                        <div className='admin-serviceCard__status_order' />
                    </div>
                    <Flex direction={'column'} gap={2}>
                        <Flex direction={'row'} gap={8} align={'center'}>
                            <span className='admin-serviceCard__room'>{props.order.room?.label ? props.order.room?.label : 'Не указано'}</span>
                        </Flex>
                        <Flex direction={'row'} gap={8}>
                            <span className='admin-serviceCard__customer'>Заказчик </span>
                            <span className='admin-serviceCard__customer-name'>{` ${props.order.guest.name} `}</span>
                        </Flex>
                    </Flex>
                </div>

                {/* <div className='admin-serviceCard__order'>
                    <span className='admin-serviceCard__blockTitle'>
                        Заказ <span className='admin-serviceCard__order-type'> {props.order?.store.store_type.label}</span>
                    </span>
                    <div className='admin-serviceCard__orderList'>
                        {props.order.products.map((x, i) => {
                            const product = props.products.find(p => parseInt(p.id) === x.id)
                            if (i <= 1) {
                                return (
                                    <div key={x.id + '-' + i} className='admin-serviceCard__orderItemWrap'>
                                        <ServiceOrderItem
                                            key={i}
                                            name={product.name}
                                            amount={x.quantity}
                                            image={DEFAULTS.STRAPI.url + product.image}
                                        />
                                        {i < props.order.products.length - 1 ?
                                            <div className='admin-serviceCard__orderDivider' />
                                            : <></>
                                        }
                                    </div>
                                )
                            } else if ((i + 1) === props.order.products.length) {
                                return (
                                    <div key={x.id + '-' + i} className='admin-serviceCard__orderItemWrap'>
                                        <div className='admin-serviceCard__additional'>
                                            и еще {props.order.products.length - 2} позиции
                                            <div className='admin-serviceCard__additional-btn' onClick={openModal}>
                                                показать всё
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        })}
                    </div>
                </div> */}

                {/* <div className='admin-serviceCard__comment'>
                    <span className='admin-serviceCard__blockTitle'>Комментарий:</span>
                    <span className='admin-serviceCard__comment-text'>
                        {props.order.comment ? props.order.comment : 'Комментарий не указан'}
                    </span>
                </div> */}
                <div className='admin-serviceCard__feedback'>
                    <Flex direction={'row'} justify={'space-between'} style={{ width: '100%' }}>
                        <span className='admin-serviceCard__blockText'>Тип заказа</span>
                        <span className='admin-serviceCard__blockTitle'>
                            {props.order?.store.store_type.label ? props.order?.store.store_type.label : 'Не указан'}
                        </span>
                    </Flex>
                    <Flex direction={'row'} justify={'space-between'} style={{ width: '100%' }}>
                        <span className='admin-serviceCard__blockText'>Телефон для связи</span>
                        <span className='admin-serviceCard__blockTitle'>{props.order.phone ? props.order.phone : 'Не указан'}</span>
                    </Flex>
                </div>
                {/* <div className='admin-serviceCard__result'>
                    <Flex direction={'row'} justify={'space-between'} style={{ width: '100%' }}>
                        <span className='admin-serviceCard__blockText'>Сумма заказа</span>
                        <span className='admin-serviceCard__blockTitle'>{props.order.products.reduce((total, x) => {
                            const product = props.products.find(p => parseInt(p.id) === x.id)
                            return total + product.price * x.quantity
                        }, 0)
                        } руб.</span>
                    </Flex>

                    <Flex direction={'row'} justify={'space-between'} style={{ width: '100%' }}>
                        <span className='admin-serviceCard__blockText'>Способ оплаты:</span>
                        <span className='admin-serviceCard__blockTitle'>{paymentType}</span>
                    </Flex>
                </div> */}
                {/* <div className='admin-serviceCard__action'>
                    <Button onClick={() => updateStatus(props.order.status, 'inwork')} variant="filled" color="blue" size='md' radius={'md'}
                        style={{ fontSize: 14, fontWeight: 500 }}>Принять</Button>
                    <Button onClick={() => updateStatus(props.order.status, 'delivered')} variant="filled" color="orange" size='md' radius={'md'}
                        style={{ fontSize: 14, fontWeight: 500 }}>Доставка</Button>
                    <Button onClick={() => updateStatus(props.order.status, 'done')} variant="filled" color={'green'} size='md' radius={'md'}
                        style={{ fontSize: 14, fontWeight: 500 }}>Выполнен</Button>
                </div> */}
            </div>
        </div>
    </>
    )
}