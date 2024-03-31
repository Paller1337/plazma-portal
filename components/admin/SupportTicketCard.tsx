import { Card, Image, Text, Group, Badge, Button, ActionIcon, Stack, Flex } from '@mantine/core'
import { DEFAULTS } from 'defaults';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react'
import { IOrderInfo, TOrderPaymentType } from 'types/order'
import { IServiceOrdered, TServiceOrderStatus } from 'types/services'
import { ISupportTicket, TSupportTicketStatus } from 'types/support';

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

export interface ICSupportTicketProps {
    id: number,
    ticket: ISupportTicket
    roomName: string
}

interface ServiceOrderItemProps {
    image?: string
    name: string
    amount: number
}

const ServiceOrderBadge = (props: { status: TSupportTicketStatus, id: number, date: string }) => {
    const checkOrderStatus = (status) => {
        // if (!props.status) return
        switch (props.status) {
            case 'new':
                return {
                    name: 'Новый',
                    color: 'blue',
                }
            // break;
            case 'inwork':
                return {
                    name: 'Доставляется',
                    color: 'green',
                }
            // break;

            case 'closed':
                return {
                    name: 'Выполнен',
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

export default function SupportTicket(props: ICSupportTicketProps) {
    async function updateStatus(status: TSupportTicketStatus, newStatus: TSupportTicketStatus) {
        try {
            const response = await fetch('/api/ticket/update', {
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
        console.log('Support Ticket: ', props.ticket, ': ', props)
    }, [props])
    return (
        <div className='admin-serviceCard'>
            <ServiceOrderBadge status={props.ticket.status} id={props.id} date={props.ticket.create_at} />

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
                        <span className='admin-serviceCard__customer-name'>{props.ticket.customer?.name}</span>
                    </Flex>
                </Flex>
            </div>

            <div className='admin-serviceCard__comment'>
                <span className='admin-serviceCard__blockTitle'>Комментарий:</span>
                <span className='admin-serviceCard__comment-text'>
                    {props.ticket.messages ? props.ticket.messages[0].message : 'Комментарий не указан'}
                </span>
            </div>
            <div className='admin-serviceCard__feedback'>
                <Flex direction={'row'} justify={'space-between'} style={{ width: '100%' }}>
                    <span className='admin-serviceCard__blockTitle'>Телефон для связи:</span>
                    <span className='admin-serviceCard__blockTitle'>{props.ticket.customer?.phone ? props.ticket.customer?.phone : 'Не указан'}</span>
                </Flex>
            </div>

            <div className='admin-serviceCard__action'>
                {props.ticket.status !== 'inwork' && <Button onClick={() => updateStatus(props.ticket.status, 'inwork')} variant="filled" color="blue" size='md' radius={'md'}
                    style={{ fontSize: 14, fontWeight: 500 }}>В работу</Button>}
                {props.ticket.status !== 'closed' && <Button onClick={() => updateStatus(props.ticket.status, 'closed')} variant="filled" color="orange" size='md' radius={'md'}
                    style={{ fontSize: 14, fontWeight: 500 }}>Завершить</Button>}
            </div>
        </div>
    )
}