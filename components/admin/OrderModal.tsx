// OrderSendModal.tsx
import React from 'react'
import ReactModal from 'react-modal'
import Button from '../Button'
import { ReactSVG } from 'react-svg'
import { useRouter } from 'next/router'
import { ICServiceOrderProps, ServiceOrderBadge, ServiceOrderItem } from './ServiceOrder'
import { Flex } from '@mantine/core'
import { DEFAULTS } from 'defaults'

ReactModal.setAppElement('#__next') // Для Next.js обычно это #__next, для create-react-app это #root

const AdminOrderModal = ({ isOpen, onClose, order }: { isOpen: boolean, onClose: () => void, order: ICServiceOrderProps }) => {
    const router = useRouter()
    const paymentType = order.orderInfo.paymentType === 'bank-card' ? 'Банковская карта' : order.orderInfo.paymentType === 'cash' ? 'Наличные' : 'Не указан'

    return (
        <ReactModal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="OrderAdmin-Modal"
            overlayClassName="Overlay"
        // shouldCloseOnOverlayClick={false}
        >
            <div className="OrderAdmin-Modal__content">
                <ReactSVG className='OrderAdmin-Modal__close' src='/svg/modal-close.svg' onClick={onClose} />
                <ServiceOrderBadge status={order.orderInfo.status} id={order.id} date={order.orderInfo.createAt} />

                <div className='admin-serviceCard__header'>
                    <div className='admin-serviceCard__status'>
                        <div />
                    </div>
                    <Flex direction={'column'} gap={2}>
                        <Flex direction={'row'} gap={8} align={'center'}>
                            <span className='admin-serviceCard__room'>{order.roomName}</span>
                        </Flex>
                        <Flex direction={'row'} gap={2}>
                            <span className='admin-serviceCard__customer'>Заказчик:</span>
                            <span className='admin-serviceCard__customer-name'>{order.orderInfo.customer.name}</span>
                        </Flex>
                    </Flex>
                </div>

                <div className='admin-serviceCard__order'>
                    <span className='admin-serviceCard__blockTitle'>Заказ:</span>
                    <div className='admin-serviceCard__orderList'>
                        {order.order.map((x, i) => (
                            <div key={x.service.id + '-' + i} className='admin-serviceCard__orderItemWrap'>
                                <ServiceOrderItem
                                    key={i}
                                    name={x.service.attributes.title}
                                    amount={x.quantity}
                                    image={DEFAULTS.SOCKET_URL.prod + x.service.attributes.images.data[0].attributes.url}
                                />
                                {i < order.order.length - 1 ?
                                    <div className='admin-serviceCard__orderDivider' />
                                    : <></>
                                }
                            </div>
                        )
                        )}
                    </div>
                </div>

                <div className='admin-serviceCard__comment'>
                    <span className='admin-serviceCard__blockTitle'>Комментарий:</span>
                    <span className='admin-serviceCard__comment-text'>
                        {order.orderInfo.description ? order.orderInfo.description : 'Комментарий не указан'}
                    </span>
                </div>
                <div className='admin-serviceCard__feedback'>
                    <Flex direction={'row'} justify={'space-between'} style={{ width: '100%' }}>
                        <span className='admin-serviceCard__blockTitle'>Телефон для связи:</span>
                        <span className='admin-serviceCard__blockTitle'>{order.orderInfo.customer.phone ? order.orderInfo.customer.phone : 'Не указан'}</span>
                    </Flex>
                </div>
                <div className='admin-serviceCard__result'>
                    <Flex direction={'row'} justify={'space-between'} style={{ width: '100%' }}>
                        <span className='admin-serviceCard__blockText'>Сумма заказа:</span>
                        <span className='admin-serviceCard__blockTitle'>{order.order.reduce(
                            (total, service) => total + service.service.attributes.price * service.quantity, 0)
                        } руб.</span>
                    </Flex>

                    <Flex direction={'row'} justify={'space-between'} style={{ width: '100%' }}>
                        <span className='admin-serviceCard__blockText'>Способ оплаты:</span>
                        <span className='admin-serviceCard__blockTitle'>{paymentType}</span>
                    </Flex>
                </div>
            </div>
        </ReactModal>
    )
}

export default AdminOrderModal
