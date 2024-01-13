import { Card, Image, Text, Group, Badge, Button, ActionIcon, Stack, Flex } from '@mantine/core'
import { TOrderPaymentType } from 'types/order';
import { IServiceOrdered, TServiceOrderStatus } from 'types/services';
// import classes from './BadgeCard.module.css';

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

interface ServiceOrderProps {
    status: TServiceOrderStatus
    room: string,
    customer: string,
    order: IServiceOrdered[],
    comment: string,
    phone: string,
    paymentAmount: number,
    paymentType: TOrderPaymentType,
}

const cardData = {
    room: 'Домик на набережной 3',
    customer: 'Анастасия Сычева',
    order: [
        {
            quantity: 3,
            service: {
                attributes: {
                    title: 'Халат',
                    price: 120,
                    images: {
                        data: [
                            {
                                attributes: {
                                    url: '',
                                    height: 10,
                                    width: 10,
                                }
                            }
                        ]
                    }
                },
            }
        }
    ],
    comment: '23',
    phone: '+79539687367',
    paymentAmount: 1330,
    paymentType: 'bank-card',
} as ServiceOrderProps

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

export default function ServiceOrder(props: ServiceOrderProps) {
    const paymentType = props.paymentType === 'bank-card' ? 'Банковская карта' : props.paymentType === 'cash' ? 'Наличные' : 'Не указан'

    return (
        <div className='admin-serviceCard'>
            {props.status === 'new' ?
                <Badge variant="light" className='admin-serviceCard__badge'>Новый</Badge>
                : <></>
            }
            <div className='admin-serviceCard__header'>
                <div className='admin-serviceCard__status'>
                    <div />
                </div>
                <Flex direction={'column'} gap={2}>
                    <Flex direction={'row'} gap={8} align={'center'}>
                        <span className='admin-serviceCard__room'>{props.room}</span>
                    </Flex>
                    <Flex direction={'row'} gap={2}>
                        <span className='admin-serviceCard__customer'>Заказчик:</span>
                        <span className='admin-serviceCard__customer-name'>{props.customer}</span>
                    </Flex>
                </Flex>
            </div>

            <div className='admin-serviceCard__order'>
                <span className='admin-serviceCard__blockTitle'>Заказ:</span>
                <div className='admin-serviceCard__orderList'>
                    {props.order.map((x, i) => <>
                        <ServiceOrderItem
                            key={i}
                            name={x.service.attributes.title}
                            amount={x.quantity}
                            image={'https://strapi.kplazma.ru' + x.service.attributes.images.data[0].attributes.url}
                        />
                        {i < cardData.order.length - 1 ?
                            <div className='admin-serviceCard__orderDivider' />
                            : <></>
                        }
                    </>)}
                </div>
            </div>

            <div className='admin-serviceCard__comment'>
                <span className='admin-serviceCard__blockTitle'>Комментарий:</span>
                <span className='admin-serviceCard__comment-text'>
                    {props.comment ? props.comment : 'Комментарий не указан'}
                </span>
            </div>
            <div className='admin-serviceCard__feedback'>
                <Flex direction={'row'} justify={'space-between'} style={{ width: '100%' }}>
                    <span className='admin-serviceCard__blockTitle'>Телефон для связи:</span>
                    <span className='admin-serviceCard__blockTitle'>{props.phone ? props.phone : 'Не указан'}</span>
                </Flex>
            </div>
            <div className='admin-serviceCard__result'>
                <Flex direction={'row'} justify={'space-between'} style={{ width: '100%' }}>
                    <span className='admin-serviceCard__blockText'>Сумма заказа:</span>
                    <span className='admin-serviceCard__blockTitle'>{props.paymentAmount} руб.</span>
                </Flex>

                <Flex direction={'row'} justify={'space-between'} style={{ width: '100%' }}>
                    <span className='admin-serviceCard__blockText'>Способ оплаты:</span>
                    <span className='admin-serviceCard__blockTitle'>{paymentType}</span>
                </Flex>
            </div>
            <div className='admin-serviceCard__action'>
                <Button variant="filled" color="green" size='md' radius={'md'}>Принять</Button>
                <Button variant="filled" size='md' radius={'md'}>Выполнен</Button>
            </div>
        </div>
    )
}