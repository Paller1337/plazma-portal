import { Card, Image, Text, Group, Badge, Button, ActionIcon, Stack, Flex } from '@mantine/core'
import { DEFAULTS } from 'defaults';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react'
import { IOrder, IProduct, TOrderPaymentType, TOrderStatus } from 'types/order'
import { IServiceOrdered, TServiceOrderStatus } from 'types/services'
import AdminOrderModal from './OrderModal';
import { axiosInstance } from 'helpers/axiosInstance';
import { IPaymentStatus } from '@a2seven/yoo-checkout';

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
    onClick?: () => void
}

interface ServiceOrderItemProps {
    image?: string
    name: string
    amount: number
}

export interface IPaymentData {
    createdAt: string
    id: number
    metadata: any
    payment_id: string
    publishedAt: string
    status: IPaymentStatus
    updatedAt: string
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

export const ServiceOrderBadge = (props: { order: IOrder, min?: boolean }) => {
    const [isIdVisible, setIsIdVisible] = useState(false)

    const toggleIdVisible = () => setIsIdVisible(p => !p)

    const checkOrderStatus = (status) => {
        // if (!props.status) return
        switch (props.order.status) {
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

            case 'canceled':
                return {
                    name: 'Отменен',
                    color: 'red',
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

    const badge = checkOrderStatus(props.order.status)
    const date = DateTime.fromISO(props.order.create_at).toLocaleString({ weekday: 'short', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit' })

    return (
        <Group wrap='nowrap' w='100%' justify='flex-end' pos={'absolute'} top={0}>
            {/* <span className='admin-serviceCard__date'>{isIdVisible ? `ID: ${props.order?.id}` : date}</span> */}
            <span
                onMouseEnter={() => setIsIdVisible(true)}
                onMouseLeave={() => setIsIdVisible(false)}
                className='admin-serviceCard__id'
                style={{ width: '150px' }}
            >
                {isIdVisible ? `ID: ${props.order?.id}` : date}
            </span>
            <Group wrap='nowrap' p={4} gap={4} pos={'absolute'} right={4} top={4}>
                {!props.min && props.order?.paymentType === 'external' ?
                    <Badge autoContrast variant="light" color={props.order?.paid_for ? 'teal' : 'orange'}
                        className='admin-serviceCard__badge'>
                        {props.order?.paid_for ? 'оплачен' : 'онлайн оплата'}
                    </Badge>
                    : <></>}
                <Badge autoContrast variant="light" color={badge.color} className='admin-serviceCard__badge' >
                    {badge.name}
                </Badge>
            </Group>
        </Group>
    )
}

export default function ServiceOrder(props: ICServiceOrderProps) {
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const openModal = (index) => {
        setModalIsOpen(true)
    }



    return (<>
        <AdminOrderModal isOpen={modalIsOpen} onClose={() => setModalIsOpen(false)} order={props} />

        <div className='admin-serviceCard__outer'>
            <div className={`admin-serviceCard${props.isVisualNew ? ' admin-serviceCard_new' : ''}`} onClick={() => {
                openModal(props.order.id)
                props?.onClick ? props.onClick() : () => { }
            }}>
                <ServiceOrderBadge order={props.order} />
                <Stack></Stack>
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

            </div>
        </div>
    </>
    )
}