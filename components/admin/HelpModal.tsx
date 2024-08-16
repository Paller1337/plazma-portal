// OrderSendModal.tsx
import React, { useState } from 'react'
import ReactModal from 'react-modal'
import { ReactSVG } from 'react-svg'
import { useRouter } from 'next/router'
import { ICServiceOrderProps, ServiceOrderBadge, ServiceOrderItem } from './ServiceOrder'
import { Box, Button, Flex, Group, LoadingOverlay, Spoiler, Stack, Table, Text } from '@mantine/core'
import { DEFAULTS } from 'defaults'
import { TOrderStatus } from 'types/order'
import { axiosInstance } from 'helpers/axiosInstance'
import { useAdminOrders } from 'context/admin/OrderContext'
import toast from 'react-hot-toast'

ReactModal.setAppElement('#__next') // Для Next.js обычно это #__next, для create-react-app это #root

interface AdminOrderModalProps {
    isOpen: boolean,
    onClose: () => void,
}

const AdminHelpModal = (props: AdminOrderModalProps) => {
    const router = useRouter()

    const { dispatch } = useAdminOrders()
    const [visibleLoadingOverlay, setVisibleLoadingOverlay] = useState(false)

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
            className="OrderAdmin-Modal"
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
                bg='var(--mantine-color-gray-1)'>
                <Stack align='flex-start' gap={14}>
                    <Group w='100%' align='center' justify='flex-start' >
                        <Text w={140} fz='lg' fw={600} c='var(--portal-color-text)' >
                            Заказчик:
                        </Text>
                        <Text fz='lg' fw={800} c='var(--portal-color-text)'>Paller</Text>
                    </Group>
                    <Group wrap='nowrap' w='100%' align='flex-start' justify='flex-start' >
                        <Text w={140} fz='lg' fw={600} c='var(--portal-color-text)' >
                            Комментарий:
                        </Text>
                        <Spoiler mt={4} maxHeight={54}
                            showLabel="Ещё"
                            hideLabel="Скрыть"
                            fz='sm' fw={400}
                            c='var(--portal-color-text)'
                            style={{ wordBreak: 'break-word', borderRadius: '12px' }}>ОЧКО ГОРИТ СРОЧНО ВЫЗЫВАЙТЕ ПОЖАРНЫХ И СЛУЖБУ СПАСЕНИЯ Я СЕЛ НА БУТЫЛКУ И ОНА ЛОПНУЛАОЧКО ГОРИТ СРОЧНО ВЫЗЫВАЙТЕ ПОЖАРНЫХ И СЛУЖБУ СПАСЕНИЯ Я СЕЛ НА БУТЫЛКУ И ОНА ЛОПНУЛАОЧКО ГОРИТ СРОЧНО ВЫЗЫВАЙТЕ ПОЖАРНЫХ И СЛУЖБУ СПАСЕНИЯ Я СЕЛ НА БУТЫЛКУ И ОНА ЛОПНУЛАОЧКО ГОРИТ СРОЧНО ВЫЗЫВАЙТЕ ПОЖАРНЫХ И СЛУЖБУ СПАСЕНИЯ Я СЕЛ НА БУТЫЛКУ И ОНА ЛОПНУЛАОЧКО ГОРИТ СРОЧНО ВЫЗЫВАЙТЕ ПОЖАРНЫХ И СЛУЖБУ СПАСЕНИЯ Я СЕЛ НА БУТЫЛКУ И ОНА ЛОПНУЛА
                        </Spoiler>
                    </Group>
                    <Group w='100%' align='center' justify='space-between'>
                        <Button
                            variant="filled"
                            color="var(--mantine-color-blue-6)"
                            fw={500}
                            fz='sm'
                            size='md' radius={'md'}
                            style={{ flex: '1 1 auto' }}>
                            Принять
                        </Button>
                        <Button
                            variant="filled"
                            color='var(--mantine-color-green-7)'
                            size='md'
                            fz='sm'
                            radius={'md'}
                            fw={500}
                            style={{ flex: '1 1 auto' }}>
                            Выполнен
                        </Button>
                    </Group>

                </Stack>
            </Box>


        </ReactModal >
    )
}

export default AdminHelpModal
