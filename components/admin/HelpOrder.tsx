import { Card, Image, Text, Group, Badge, Button, ActionIcon, Stack, Flex, Box, Grid } from '@mantine/core'
import { DEFAULTS } from 'defaults';
import { DateTime } from 'luxon';
import { useEffect, useState } from 'react'
import { IOrder, IProduct, TOrderPaymentType, TOrderStatus } from 'types/order'
import { IServiceOrdered, TServiceOrderStatus } from 'types/services'
import AdminOrderModal from './OrderModal';
import AdminHelpModal from './HelpModal';


interface HelpDeskProps {

}


export const HelpDeskBadge = (props: { status: TOrderStatus, id: number, date: string }) => {
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
        <AdminHelpModal isOpen={modalIsOpen} onClose={() => setModalIsOpen(false)} />


        <Grid.Col span={{ base: 12, lg: 4 }}>
            <Box pt={10} pb={24} className='admin-serviceCard' onClick={() => openModal(true)}>
                {/* <HelpOrderBadge status={props.order.status} id={props.order.id} date={props.order.create_at} /> */}
                <Group px={12} w='100%' align='center1' justify='space-between'>
                    <Text fz='xs' fw={400} c='dimmed'>чт, 15 августа в 16:41</Text>
                    <Badge autoContrast variant="light">Новый</Badge>
                </Group>
                <Stack w='100%' px={24} align='flex-start' gap={6}>
                    <Group w='100%' align='center' justify='flex-start'>
                        <div className='admin-serviceCard__status'>
                            <div className='admin-serviceCard__status_helpDesk' />
                        </div>
                        <Stack flex='flex-start' gap={2}>
                            <Text fz='md' fw={600} c='var(--portal-color-text)' style={{ wordBreak: 'break-word' }}>
                                Домик на набережной 3
                            </Text>
                            <Group align='center' gap={6}>
                                <Text fz='sm' fw={600} c='var(--portal-color-text)'>
                                    Заказчик
                                </Text>
                                <Text fz='sm' fw={400} c='var(--portal-color-text-secondary)'>
                                    Анастасия Сыч
                                </Text>
                            </Group>
                        </Stack>
                    </Group>
                    <Group mt={10} w='100%' align='center' justify='space-between'>
                        <Text fz='sm' fw={400} c='var(--portal-color-text-secondary)'>
                            Тип проблемы
                        </Text>
                        <Text fz='sm' fw={600} c='var(--portal-color-text-secondary)'>
                            Wi-Fi
                        </Text>
                    </Group>
                    <Group w='100%' align='center' justify='space-between'>
                        <Text fz='sm' fw={400} c='var(--portal-color-text-secondary)'>
                            Телефон для связи
                        </Text>
                        <Text fz='sm' fw={600} c='var(--portal-color-text-secondary)'>
                            +79539687367
                        </Text>
                    </Group>
                </Stack>
            </Box>
        </Grid.Col>
    </>
    )
}