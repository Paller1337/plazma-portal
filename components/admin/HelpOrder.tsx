import { Card, Image, Text, Group, Badge, Button, ActionIcon, Stack, Flex, Box, Grid } from '@mantine/core'
import { DEFAULTS } from 'defaults';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react'
import { IOrder, IProduct, TOrderPaymentType, TOrderStatus } from 'types/order'
import { IServiceOrdered, TServiceOrderStatus } from 'types/services'
import AdminOrderModal from './OrderModal'
import AdminHelpModal from './HelpModal'
import { ISupportTicket, TSupportTicketStatus } from 'types/support'


interface HelpDeskProps {
    ticket: ISupportTicket
    isVisualNew?: boolean
}


export const HelpDeskBadge = (props: { status: TSupportTicketStatus, id: number, date: string }) => {
    const checkOrderStatus = (status) => {
        // if (!props.status) return
        switch (props.status) {
            case 'new':
                return {
                    name: 'Новый',
                    color: 'blue',
                }

            case 'closed':
                return {
                    name: 'Закрыта',
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
        <Group px={12} w='100%' align='center' justify='space-between'>
            <span className='admin-serviceCard__date'>{date}</span>
            <span className='admin-serviceCard__id'>ID:{props.id}</span>
            <Badge autoContrast variant="light" color={badge.color} className='admin-serviceCard__badge' >
                {badge.name}
            </Badge>
        </Group>
    )
}

export default function HelpDesk(props: HelpDeskProps) {
    const [modalIsOpen, setModalIsOpen] = useState(false)

    const openModal = (index) => {
        setModalIsOpen(true)
    }
    // const paymentType = props.order.paymentType === 'bank-card' ? 'Банковская карта' : props.order.paymentType === 'cash' ? 'Наличные' : 'Не указан'


    // useEffect(() => {
    //     console.log('ServiceOrder: ', props.orderInfo.customer.name, ': ', props)
    // }, [props])
    return (<>
        <AdminHelpModal ticket={props.ticket} isOpen={modalIsOpen} onClose={() => setModalIsOpen(false)} />

        <Grid.Col span={{ base: 12, lg: 4 }}>
            <Box pt={10} pb={24} className={`admin-serviceCard${props.isVisualNew ? ' admin-serviceCard_new' : ''}`} onClick={() => openModal(true)}>
                <HelpDeskBadge status={props.ticket.status} id={props.ticket.id} date={props.ticket.create_at} />
                {/* <Group px={12} w='100%' align='center' justify='space-between'>
                    <Text fz='xs' fw={400} c='dimmed'>чт, 15 августа в 16:41</Text>
                    <Badge autoContrast variant="light">Новый</Badge>
                </Group> */}
                <Stack w='100%' px={24} align='flex-start' gap={0}>
                    <Group w='100%' align='center' justify='flex-start'>
                        <div className='admin-serviceCard__status'>
                            <div className='admin-serviceCard__status_ticket' />
                        </div>
                        <Stack flex='flex-start' gap={0} py={12}>
                            <Text fz='lg' fw={600} c='var(--portal-color-text)' style={{ wordBreak: 'break-word' }}>
                                {props.ticket.room?.label ? props.ticket.room?.label : 'Не указано'}
                            </Text>
                            <Group align='center' gap={6}>
                                <Text fz='md' fw={600} c='var(--portal-color-text-secondary)'>
                                    Заказчик
                                </Text>
                                <Text fz='md' fw={600} c='var(--portal-color-text)'>
                                    {` ${props.ticket.guest.name} `}
                                </Text>
                            </Group>
                        </Stack>
                    </Group>
                    <Group mt={10} w='100%' align='center' justify='space-between'>
                        <Text fz='md' fw={600} c='var(--portal-color-text-secondary)'>
                            Тип проблемы
                        </Text>
                        <Text fz='md' fw={600} c='var(--portal-color-text)'>
                            Wi-Fi
                        </Text>
                    </Group>
                    <Group w='100%' align='center' justify='space-between'>
                        <Text fz='md' fw={600} c='var(--portal-color-text-secondary)'>
                            Телефон для связи
                        </Text>
                        <Text fz='md' fw={600} c='var(--portal-color-text)'>
                            {props.ticket.guest.phone ? props.ticket.guest.phone : 'Не указан'}
                        </Text>
                    </Group>
                </Stack>
            </Box>
        </Grid.Col>
    </>
    )
}