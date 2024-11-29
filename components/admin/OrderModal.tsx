import React, { useEffect, useState } from 'react'
import ReactModal from 'react-modal'
import { ReactSVG } from 'react-svg'
import { useRouter } from 'next/router'
import { ICServiceOrderProps, ServiceOrderBadge, ServiceOrderItem } from './ServiceOrder'
import { Button, Flex, LoadingOverlay, Stack, Table } from '@mantine/core'
import { DEFAULTS } from 'defaults'
import { TOrderStatus } from 'types/order'
import { axiosInstance } from 'helpers/axiosInstance'
import { useAdminOrders } from 'context/admin/OrderContext'
import toast from 'react-hot-toast'
import { useIiko } from 'context/IikoContext'
import { getPaymentType } from 'helpers/getPaymentType'

ReactModal.setAppElement('#__next') // Для Next.js обычно это #__next, для create-react-app это #root

interface AdminOrderModalProps {
    isOpen: boolean,
    onClose: () => void,
    order: ICServiceOrderProps
}

const AdminOrderModal = (props: AdminOrderModalProps) => {
    const router = useRouter()
    const paymentType = getPaymentType(props.order.order?.paymentType)
    const { dispatch } = useAdminOrders()
    const [visibleLoadingOverlay, setVisibleLoadingOverlay] = useState(false)
    const { nomenclature } = useIiko()

    useEffect(() => console.log(props.order), [props.isOpen])

    async function updateStatus(status: TOrderStatus, newStatus: TOrderStatus) {
        setVisibleLoadingOverlay(true)
        try {
            const response = await axiosInstance.put('/api/order/update',
                {
                    data: { order: props.order.order, status, newStatus }
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

            if (response.status !== 200) {
                toast.error('Ошибка при обновлении статуса заказа')
                setVisibleLoadingOverlay(false)
                throw new Error('Ошибка при обновлении статуса заказа')
            }

            setVisibleLoadingOverlay(false)
            // const data = await response.json();
            console.log('Status update: ', response.data)
            dispatch({
                type: 'UPDATE_ORDER_STATUS',
                payload: {
                    orderId: props.order.order.id,
                    status: response.data.newData.data.attributes.status,
                    previous_status: response.data.newData.data.attributes.previous_status,
                }
            })
            // return data;
            return
        } catch (error) {
            console.error('Ошибка:', error);
            throw error;
        }
    }

    const rows =
        props.order.order.store.store_type?.value === 'eat'
            ? props.order.order.iikoProducts.map((x, i) => {
                const product = nomenclature?.products.find(p => p.id === x.product)
                // const product = props.order.products.find(p => parseInt(p.id) === x.id)
                // console.log('nomenclature ', nomenclature)
                // console.log('product', product)
                return (
                    <Table.Tr key={product?.name + i + x.quantity * x?.price}>
                        <Table.Td>{product?.name}</Table.Td>
                        <Table.Td>{x.quantity}</Table.Td>
                        <Table.Td>{x?.price}</Table.Td>
                        <Table.Td>{x.quantity * x?.price}</Table.Td>
                    </Table.Tr>
                )
            })
            : props.order.order.products.map((x, i) => {
                const product = props.order.products.find(p => parseInt(p.id) === x.id)
                return (
                    <Table.Tr key={product?.name + i + x.quantity * product?.price}>
                        <Table.Td>{product?.name}</Table.Td>
                        <Table.Td>{x.quantity}</Table.Td>
                        <Table.Td>{product?.price}</Table.Td>
                        <Table.Td>{x.quantity * product?.price}</Table.Td>
                    </Table.Tr>
                )
            })

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
                    Управление заказом
                    <ReactSVG className='OrderAdmin-Modal__close' style={{ cursor: 'pointer' }} src='/svg/admin/admin_modal-close.svg' onClick={props.onClose} />
                </div>
            </div>

            <div className='OrderAdmin-Modal__main'>
                <div className='OrderAdmin-Modal__main-section left-section'>
                    <div className='OrderAdmin-Modal__info AdminModal-block'>
                        {/* {props.order.order.status + ' ' + props.order.order.id} */}
                        <Stack style={{ position: 'relative', borderRadius: 0, borderBottom: '1px solid rgb(38, 46, 74)' }} h={37} px={0} mt={-10}>
                            <ServiceOrderBadge status={props.order.order.status} id={props.order.order.id} date={props.order.order.create_at} />
                        </Stack>
                        <div className='OrderAdmin-Modal__info-header'>
                            <span className='OrderAdmin-Modal__info-title'>Заказ от {props.order.order.guest?.name ? props.order.order.guest?.name : 'гостя'}</span>
                            <span className='OrderAdmin-Modal__info-subtitle'>
                                {props.order.order.room?.label ? props.order.order.room?.label : 'Свяжитесь с гостем для уточнения'}
                            </span>
                        </div>
                        <div className='OrderAdmin-Modal__info-section'>
                            <div className='column'>
                                <span className='title'>Комментарий</span>
                                <span className='value'>{props.order.order.comment ? props.order.order.comment : 'Нет комментария'}</span>
                            </div>
                        </div>
                        <div className='OrderAdmin-Modal__info-section'>
                            <div className='row'>
                                <span className='title'>Телефон для связи</span>
                                <span className='value'>{props.order.order.guest.phone}</span>
                            </div>
                        </div>
                        <div className='OrderAdmin-Modal__info-section'>
                            <div className='row'>
                                <span className='title'>Сумма заказа</span>
                                <span className='value'>{
                                    props.order.order.store.store_type?.value === 'eat'
                                        ?
                                        props.order.order.iikoProducts.reduce((total, x) => {
                                            return total + x?.price * x.quantity
                                        }, 0)
                                        :
                                        props.order.order.products.reduce((total, x) => {
                                            const product = props.order.products.find(p => parseInt(p.id) === x.id)
                                            return total + product?.price * x.quantity
                                        }, 0)
                                } руб.</span>
                            </div>
                            <div className='row'>
                                <span className='title'>Способ оплаты</span>
                                <span className='value'>{getPaymentType(props.order.order.paymentType)}</span>
                            </div>
                            {/* <div className='row'>
                                <span className='title'>Способ оплаты</span>
                                <span className='value'>{props.order.order.guest.phone}</span>
                            </div> */}
                        </div>
                    </div>
                    <div className='OrderAdmin-Modal__actions AdminModal-block'>
                        <div className='AdminModal-block__header'>
                            <span className='AdminModal-block__header-title'>Действия</span>
                        </div>
                        <div className='OrderAdmin-Modal__actions-content'>
                            <Button onClick={() => updateStatus(props.order.order.status, 'inwork')} variant="filled" color="blue" size='md' radius={'md'}
                                style={{ fontSize: 14, fontWeight: 500 }}>Принять</Button>
                            <Button onClick={() => updateStatus(props.order.order.status, 'delivered')} variant="filled" color="orange" size='md' radius={'md'}
                                style={{ fontSize: 14, fontWeight: 500 }}>Доставка</Button>
                            <Button onClick={() => updateStatus(props.order.order.status, 'done')} variant="filled" color={'green'} size='md' radius={'md'}
                                style={{ fontSize: 14, fontWeight: 500 }}>Выполнен</Button>
                        </div>
                    </div>
                </div>


                <div className='OrderAdmin-Modal__main-section right-section'>
                    <div className='OrderAdmin-Modal__table AdminModal-block'>
                        <div className='AdminModal-block__header'>
                            <span className='AdminModal-block__header-title'>Таблица заказа</span>
                        </div>
                        <div className='OrderAdmin-Modal__table-content'>
                            <div className='OrderAdmin-Modal__table-wrapper'>
                                <Table.ScrollContainer minWidth={500}>
                                    <Table striped withTableBorder styles={{
                                        table: {
                                            borderRadius: '12px',
                                            color: '#252525'
                                        },
                                        th: {
                                            background: '#a0bcd5'
                                        },
                                    }}>
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th>Название</Table.Th>
                                                <Table.Th>Количество</Table.Th>
                                                <Table.Th>Цена за ед.</Table.Th>
                                                <Table.Th>Сумма</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {rows}
                                            <Table.Tr>
                                                <Table.Td></Table.Td>
                                                <Table.Td></Table.Td>
                                                <Table.Td></Table.Td>
                                                <Table.Td style={{
                                                    fontWeight: 600,
                                                    fontSize: 18,
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    Итого {
                                                        props.order.order.store.store_type?.value === 'eat'
                                                            ?
                                                            props.order.order.iikoProducts.reduce((total, x) => {
                                                                return total + x?.price * x.quantity
                                                            }, 0)
                                                            :
                                                            props.order.order.products.reduce((total, x) => {
                                                                const product = props.order.products.find(p => parseInt(p.id) === x.id)
                                                                return total + product?.price * x.quantity
                                                            }, 0)
                                                    } руб.</Table.Td>
                                            </Table.Tr>
                                        </Table.Tbody>
                                    </Table>
                                </Table.ScrollContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ReactModal>
    )
}

export default AdminOrderModal
