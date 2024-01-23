// OrderSendModal.tsx
import React from 'react'
import ReactModal from 'react-modal'
import Button from './Button'
import { ReactSVG } from 'react-svg'
import { useRouter } from 'next/router'

ReactModal.setAppElement('#__next'); // Для Next.js обычно это #__next, для create-react-app это #root

const OrderSendModal = ({ isOpen, onClose }) => {
    const router = useRouter()

    return (
        <ReactModal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="OrderSend-Modal"
            overlayClassName="Overlay"
        // shouldCloseOnOverlayClick={false}
        >
            <div className="OrderSend-Modal__content">
                <ReactSVG className='OrderSend-Modal__close' src='/svg/modal-close.svg' onClick={onClose} />
                <h2 className='OrderSend-Modal__title'>Спасибо за заказ!</h2>
                <div className='OrderSend-Modal__text-group'>
                    <span className='OrderSend-Modal__text'>Вашим заказом уже занимаются наши сотрудники.</span>
                    <span className='OrderSend-Modal__text'>Оставайтесь в приложении для отслеживания статуса заказа.</span>
                </div>

                <div className="OrderSend-Modal__actions">
                    <Button text='Мои заказы' outlined stretch onClick={() => router.push('/order/history')} />
                    <Button text='Хорошо!' stretch onClick={onClose} />
                </div>
            </div>
        </ReactModal>
    );
};

export default OrderSendModal;
