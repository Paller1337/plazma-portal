// OrderSendModal.tsx
import React, { useState } from 'react'
import ReactModal from 'react-modal'
import { ReactSVG } from 'react-svg'
import { useRouter } from 'next/router'
import { ICServiceOrderProps, ServiceOrderBadge, ServiceOrderItem } from './ServiceOrder'
import { Box, Button, Divider, Flex, Group, LoadingOverlay, Spoiler, Stack, Table, Text } from '@mantine/core'
import { DEFAULTS } from 'defaults'
import { TOrderStatus } from 'types/order'
import { axiosInstance } from 'helpers/axiosInstance'
import { useAdminOrders } from 'context/admin/OrderContext'
import toast from 'react-hot-toast'
import { ISupportTicket, TSupportTicketStatus } from 'types/support'
import { HelpDeskBadge } from './HelpOrder'

ReactModal.setAppElement('#__next') // Для Next.js обычно это #__next, для create-react-app это #root

interface AdminOrderModalProps {
    isOpen: boolean,
    onClose: () => void,
    ticket: ISupportTicket
}

const AdminHelpModal = (props: AdminOrderModalProps) => {
    const router = useRouter()

    const { dispatch } = useAdminOrders()
    const [visibleLoadingOverlay, setVisibleLoadingOverlay] = useState(false)


    async function updateStatus(status: TSupportTicketStatus, newStatus: TSupportTicketStatus) {
        setVisibleLoadingOverlay(true)
        try {
            const response = await axiosInstance.put('/api/ticket/update',
                {
                    data: { ticket: props.ticket, status, newStatus }
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

            if (response.status !== 200) {
                toast.error('Ошибка при обновлении статуса заявки')
                setVisibleLoadingOverlay(false)
                throw new Error('Ошибка при обновлении статуса заявки')
            }

            setVisibleLoadingOverlay(false)
            // const data = await response.json();
            console.log('Status update: ', response.data)
            dispatch({
                type: 'UPDATE_TICKET_STATUS',
                payload: {
                    orderId: props.ticket.id,
                    status: response.data.newData.data.attributes.status,
                    previous_status: response.data.newData.data.attributes.previous_status,
                }
            })
            return
        } catch (error) {
            console.error('Ошибка:', error);
            throw error;
        }
    }


    // const rows = props.order.order.products.map((x, i) => {
    //     const product = props.order.products.find(p => parseInt(p.id) === x.id)
    //     return (
    //         <Table.Tr key={product.name + i + x.quantity * product.price}>
    //             <Table.Td>{product.name}</Table.Td>
    //             <Table.Td>{x.quantity}</Table.Td>
    //             <Table.Td>{product.price}</Table.Td>
    //             <Table.Td>{x.quantity * product.price}</Table.Td>
    //         </Table.Tr>
    //     )
    // })

    return (
        <ReactModal
            isOpen={props.isOpen}
            onRequestClose={props.onClose}
            className="OrderAdmin-Modal medium"
            overlayClassName="Overlay"
        // shouldCloseOnOverlayClick={false}
        >
            <LoadingOverlay
                visible={visibleLoadingOverlay}
                zIndex={1000}
                overlayProps={{ radius: 'md', blur: 2 }}
                loaderProps={{ color: 'gray', type: 'oval' }}
            />
            <div className='OrderAdmin-Modal__header'>
                <div className='OrderAdmin-Modal__header-content'>
                    Управление запрсосом
                    <ReactSVG className='OrderAdmin-Modal__close' style={{ cursor: 'pointer' }} src='/svg/admin/admin_modal-close.svg' onClick={props.onClose} />
                </div>
            </div>
            <Box mt={14} mx={24} className='AdminModal-block' style={{ width: 'calc(100% - 48px)' }}
                bg='var(--mantine-color-gray-1)' pos={'relative'}>
                <HelpDeskBadge status={props.ticket.status} id={props.ticket.id} date={props.ticket.create_at} />
                <Stack align='flex-start' gap={14} pt={12}>
                    <Group w='100%' align='center' justify='flex-start' >
                        <Text w={140} fz='md' fw={600} c='var(--portal-color-text)' >
                            Заказчик:
                        </Text>
                        <Text fz='md' fw={800} c='var(--portal-color-text)'>{props.ticket?.guest?.name ? props.ticket?.guest?.name : '-'}</Text>
                    </Group>
                    <Group w='100%' align='center' justify='flex-start' >
                        <Text w={140} fz='md' fw={600} c='var(--portal-color-text)' >
                            Номер:
                        </Text>
                        <Text fz='md' fw={800} c='var(--portal-color-text)'>{props.ticket?.room?.label ? props.ticket?.room?.label : '-'}</Text>
                    </Group>
                    <Group w='100%' align='center' justify='flex-start' >
                        <Text w={140} fz='md' fw={600} c='var(--portal-color-text)' >
                            Телефон:
                        </Text>
                        <Text fz='md' fw={800} c='var(--portal-color-text)'>
                            {props.ticket?.guest?.phone ? props.ticket?.guest?.phone : '-'}
                        </Text>
                    </Group>
                    <Group wrap='nowrap' w='100%' align='flex-start' justify='flex-start' >
                        <Text w={140} fz='md' fw={600} c='var(--portal-color-text)' >
                            Комментарий:
                        </Text>
                        <Spoiler mt={4} maxHeight={54}
                            showLabel="Ещё"
                            hideLabel="Скрыть"
                            fz='md' fw={400}
                            c='var(--portal-color-text)'
                            style={{ wordBreak: 'break-word', borderRadius: '12px' }}>
                            {props.ticket?.messages[0].message ? props.ticket?.messages[0].message : '...'}
                        </Spoiler>
                    </Group>
                    <Divider size={'sm'} orientation='horizontal' w={'100%'} my={12} />
                    <Group w='100%' maw={500} align='center' mx={'auto'} justify='space-between'>
                        {props.ticket?.status === 'new' ? <Button
                            variant="filled"
                            color="var(--mantine-color-blue-6)"
                            fw={500}
                            fz='sm'
                            size='md' radius={'md'}
                            style={{ flex: '1 1 auto' }}
                            onClick={() => updateStatus(props.ticket.status, 'inwork')}
                        >
                            Принять
                        </Button>
                            : props.ticket?.status === 'inwork' ?
                                <Button
                                    variant="filled"
                                    color='var(--mantine-color-green-7)'
                                    size='md'
                                    fz='sm'
                                    radius={'md'}
                                    fw={500}
                                    style={{ flex: '1 1 auto' }}
                                    onClick={() => updateStatus(props.ticket.status, 'closed')}
                                >
                                    Выполнен
                                </Button>
                                : props.ticket?.status === 'closed' ?
                                    <Button
                                        variant="filled"
                                        color="var(--mantine-color-blue-6)"
                                        size='md'
                                        fz='sm'
                                        radius={'md'}
                                        fw={500}
                                        style={{ flex: '1 1 auto' }}
                                        onClick={() => updateStatus(props.ticket.status, 'inwork')}
                                    >
                                        Вернуть в работу
                                    </Button>
                                    : <></>
                        }
                    </Group>

                </Stack>
            </Box>


        </ReactModal >
    )
}

export default AdminHelpModal
