import { Card, Image, Text, Group, Badge, Button, ActionIcon, Stack, Flex } from '@mantine/core'
import { DEFAULTS } from 'defaults';
import { useEffect, useState } from 'react'
import { IOrderInfo, TOrderPaymentType } from 'types/order'
import { IServiceOrdered, TServiceOrderStatus } from 'types/services'

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
    id: number,
    roomName: string,
    order: IServiceOrdered[],
    orderInfo: IOrderInfo
}

interface ServiceOrderItemProps {
    image?: string
    name: string
    amount: number
}

const ServiceOrderItem = (props: ServiceOrderItemProps) => {
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

const ServiceOrderBadge = (props: { status: TServiceOrderStatus, id: number }) => {
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
                    color: 'orange',
                }
            // break;

            case 'done':
                return {
                    name: 'Выполнен',
                    color: 'green',
                }
            // break
            case 'inwork':
                return {
                    name: 'В работе',
                    color: 'gray',
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

    return (
        <Flex direction={'row'} justify={'space-between'}>
            <span className='admin-serviceCard__id'>ID:{props.id}</span>
            <Badge autoContrast variant="light" color={badge.color} className='admin-serviceCard__badge' >
                {badge.name}
            </Badge>
        </Flex>
    )
}

export default function ServiceOrder(props: ICServiceOrderProps) {
    const paymentType = props.orderInfo.paymentType === 'bank-card' ? 'Банковская карта' : props.orderInfo.paymentType === 'cash' ? 'Наличные' : 'Не указан'

    async function updateStatus(status: TServiceOrderStatus, newStatus: TServiceOrderStatus) {
        try {
            const response = await fetch('/api/order/service/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ props, status, newStatus })
            });

            if (!response.ok) {
                throw new Error('Ошибка при обновлении статуса заказа');
            }

            // const data = await response.json();
            // console.log('Status update: ', data)
            // return data;
            return
        } catch (error) {
            console.error('Ошибка:', error);
            throw error;
        }
    }

    useEffect(() => {
        console.log('ServiceOrder: ', props.orderInfo.customer.name, ': ', props)
    }, [])
    return (
        <div className='admin-serviceCard'>
            <ServiceOrderBadge status={props.orderInfo.status} id={props.id} />

            <div className='admin-serviceCard__header'>
                <div className='admin-serviceCard__status'>
                    <div />
                </div>
                <Flex direction={'column'} gap={2}>
                    <Flex direction={'row'} gap={8} align={'center'}>
                        <span className='admin-serviceCard__room'>{props.roomName}</span>
                    </Flex>
                    <Flex direction={'row'} gap={2}>
                        <span className='admin-serviceCard__customer'>Заказчик:</span>
                        <span className='admin-serviceCard__customer-name'>{props.orderInfo.customer.name}</span>
                    </Flex>
                </Flex>
            </div>

            <div className='admin-serviceCard__order'>
                <span className='admin-serviceCard__blockTitle'>Заказ:</span>
                <div className='admin-serviceCard__orderList'>
                    {props.order.map((x, i) => {
                        return (
                            <>
                                <ServiceOrderItem
                                    key={i}
                                    name={x.service.attributes.title}
                                    amount={x.quantity}
                                    image={DEFAULTS.STRAPI.url + x.service.attributes.images.data[0].attributes.url}
                                />
                                {i < props.order.length - 1 ?
                                    <div className='admin-serviceCard__orderDivider' />
                                    : <></>
                                }
                            </>
                        )
                    })}
                </div>
            </div>

            <div className='admin-serviceCard__comment'>
                <span className='admin-serviceCard__blockTitle'>Комментарий:</span>
                <span className='admin-serviceCard__comment-text'>
                    {props.orderInfo.description ? props.orderInfo.description : 'Комментарий не указан'}
                </span>
            </div>
            <div className='admin-serviceCard__feedback'>
                <Flex direction={'row'} justify={'space-between'} style={{ width: '100%' }}>
                    <span className='admin-serviceCard__blockTitle'>Телефон для связи:</span>
                    <span className='admin-serviceCard__blockTitle'>{props.orderInfo.customer.phone ? props.orderInfo.customer.phone : 'Не указан'}</span>
                </Flex>
            </div>
            <div className='admin-serviceCard__result'>
                <Flex direction={'row'} justify={'space-between'} style={{ width: '100%' }}>
                    <span className='admin-serviceCard__blockText'>Сумма заказа:</span>
                    <span className='admin-serviceCard__blockTitle'>{1000} руб.</span>
                </Flex>

                <Flex direction={'row'} justify={'space-between'} style={{ width: '100%' }}>
                    <span className='admin-serviceCard__blockText'>Способ оплаты:</span>
                    <span className='admin-serviceCard__blockTitle'>{paymentType}</span>
                </Flex>
            </div>
            <div className='admin-serviceCard__action'>
                <Button onClick={() => updateStatus(props.orderInfo.status, 'inwork')} variant="filled" color="blue" size='md' radius={'md'}>Принять</Button>
                <Button onClick={() => updateStatus(props.orderInfo.status, 'delivered')} variant="filled" color="orange" size='md' radius={'md'}>На доставку</Button>
                <Button onClick={() => updateStatus(props.orderInfo.status, 'done')} variant="filled" color={'green'} size='md' radius={'md'}>Выполнен</Button>
            </div>
        </div>
    )
}