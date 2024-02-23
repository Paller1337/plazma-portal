// OrderSendModal.tsx
import React from 'react'
import ReactModal from 'react-modal'
import Button from './Button'
import { ReactSVG } from 'react-svg'
import { useRouter } from 'next/router'

ReactModal.setAppElement('#__next'); // Для Next.js обычно это #__next, для create-react-app это #root

const SupportTicketSendModal = ({ isOpen, onClose }) => {
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
                <h2 className='OrderSend-Modal__title'>Спасибо за обращение!</h2>
                <div className='OrderSend-Modal__text-group'>
                    <span className='OrderSend-Modal__text'>Ваша заявка уже передана нашим сотрудникам.</span>
                    <span className='OrderSend-Modal__text'>Оставайтесь в приложении для отслеживания статуса заказа.</span>
                </div>

                <div className="OrderSend-Modal__actions">
                    <Button text='Мои заявки' outlined stretch onClick={() => router.push('/help/history')} />
                    <Button text='Хорошо!' stretch onClick={onClose} />
                </div>
            </div>
        </ReactModal>
    );
};

export default SupportTicketSendModal
