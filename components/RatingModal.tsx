// OrderSendModal.tsx
import React, { useEffect, useState } from 'react'
import ReactModal from 'react-modal'
import Button from './Button'
import { ReactSVG } from 'react-svg'
import { useRouter } from 'next/router'
import { IProduct } from 'pages/store/[id]'
import { DEFAULTS } from 'defaults'
import { useCart } from 'context/CartContext'
import { Group, Rating, Stack, Text, ThemeIcon } from '@mantine/core'
import { SmileIcon } from './svg/library'
import { telegramSendFeedback } from 'helpers/telegram'
import { useLocalStorage } from '@mantine/hooks'

ReactModal.setAppElement('#__next'); // Для Next.js обычно это #__next, для create-react-app это #root

interface IProps {
    isOpen: boolean,
    onClose: () => void,
    storeId?: string,
    product?: IProduct
}


const RatingModal = (props: IProps) => {
    const router = useRouter()
    const [rating, setRating] = useState(0)
    const [isRated, setIsRated] = useState(false)

    const [isRatedStorage, setIsRatedStorage] = useLocalStorage<
        true | false
    >({
        key: 'is-rated',
        defaultValue: false,
    });

    const handleSaveRating = async () => {
        setIsRated(true)
        setIsRatedStorage(true)
        if (rating < 4) {
            await telegramSendFeedback(rating.toString())
        }
    }

    const yaMaps = () => {
        window.open('https://yandex.ru/maps/-/CDToBSJD', '_ blank')
    }
    return (
        <ReactModal
            isOpen={props.isOpen}
            onRequestClose={props.onClose}
            className="Product-Modal"
            overlayClassName="Overlay"
        // shouldCloseOnOverlayClick={false}
        >
            <div className="Product-Modal__content">
                <ReactSVG color='#fff' className='Product-Modal__close' src='/svg/modal-close.svg' onClick={props.onClose} />
                {!isRated && !isRatedStorage ? <Stack w='100%' align='center' justify='center' py={24} px={24} gap={16} >
                    <Text fz='xl' fw={700} c='var(--portal-color-text)'>Поставьте оценку</Text>
                    <Rating value={rating} onChange={setRating} defaultValue={1} size='xl' />
                    <Button text='Отправить' stretch bgColor='#56754B' color='#fff' onClick={handleSaveRating} />
                </Stack> :
                    <Stack w='100%' align='center' justify='center' py={24} px={24} gap={16}>
                        <Text fz='xl' fw={700} c='var(--portal-color-text)'>Спасибо за оценку</Text>
                        <ThemeIcon variant='transparent' size={140}>
                            <SmileIcon size={140} color='var(--mantine-color-gray-3)' />
                        </ThemeIcon>
                        {rating >= 4 ?
                            <Stack>
                                <Button text='Оставьте о нас отзыв на яндекс картах' stretch bgColor='#fc0' color='#000' onClick={yaMaps} />
                                <Button text='Закрыть' stretch bgColor='#56754B' color='#fff' onClick={props.onClose} />
                            </Stack>
                            :
                            <Button text='Закрыть' stretch bgColor='#56754B' color='#fff' onClick={props.onClose} />}
                    </Stack>}
            </div>
        </ReactModal>
    );
};

export default RatingModal
