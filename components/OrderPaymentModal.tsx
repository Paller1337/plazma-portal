import React from 'react'
import ReactModal from 'react-modal'
import Button from './Button'
import { ReactSVG } from 'react-svg'
import { useRouter } from 'next/router'
import { Stack } from '@mantine/core'

ReactModal.setAppElement('#__next'); // Для Next.js обычно это #__next, для create-react-app это #root

const OrderPaymentModal = ({ isOpen, onClose, onAfterOpen }) => {
    const router = useRouter()

    return (
        <ReactModal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="OrderPayment-Modal"
            overlayClassName="Overlay"
            onAfterOpen={onAfterOpen}
        // shouldCloseOnOverlayClick={false}
        >
            <div className="OrderPayment-Modal__content">
                <ReactSVG className='OrderPayment-Modal__close' src='/svg/modal-close.svg' onClick={onClose} />
                <h2 className='OrderPayment-Modal__title'>Оплата заказа</h2>
                <Stack mt={12} w={'100%'} pt={12} style={{overflowY: 'scroll'}}>
                    <div id="payment-form"></div>
                </Stack>
                <div className="OrderPayment-Modal__actions">
                    <Button text='Отмена' outlined stretch onClick={onClose} />
                </div>
            </div>
        </ReactModal>
    );
};

export default OrderPaymentModal;
