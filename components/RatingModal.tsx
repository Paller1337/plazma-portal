// OrderSendModal.tsx
import React, { useEffect, useState } from 'react'
import ReactModal from 'react-modal'
import Button from './Button'
import { ReactSVG } from 'react-svg'
import { useRouter } from 'next/router'
import { IProduct } from 'pages/store/[id]'
import { DEFAULTS } from 'defaults'
import { useCart } from 'context/CartContext'
import { Group, Paper, Rating, Stack, Text, Textarea, ThemeIcon, Title } from '@mantine/core'
import { SmileIcon } from './svg/library'
import { telegramSendFeedback } from 'helpers/telegram'
import { useLocalStorage } from '@mantine/hooks'
import { FaRankingStar, FaStar } from 'react-icons/fa6'
import { notify } from 'utils/notify'
import { useAuth } from 'context/AuthContext'
import axios from 'axios'
import { metrika } from 'utils/metrika'

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
    const [review, setReview] = useState('')
    const [isRated, setIsRated] = useState(false)
    const { visitorId, currentUser } = useAuth()

    const [isRatedStorage, setIsRatedStorage] = useLocalStorage({
        key: 'review',
        defaultValue: {
            isRated: false,
            rating: 0,
            review: '',
        },
    });

    useEffect(() => console.log({ review }), [review])

    const sendReview = async (visitorId: string, userId: number, rating: number, review: string) => {
        console.log({
            visitorId,
            userId,
            rating,
            review
        })
        const res = await axios.post(`${DEFAULTS.GENERAL_URL.app}/api/review`, {
            data: {
                visitorId,
                userId,
                rating,
                review,
            }
        })
        console.log({ res })
        return res
    }

    const handleSaveRating = async () => {
        if (rating === 0) {
            notify({
                icon: <FaStar />,
                title: 'Ваш отзыв',
                message: 'Необходимо проголосовать для отправки отзыва',
            })
            return
        }
        setIsRated(true)
        setIsRatedStorage({
            isRated: true,
            rating: rating,
            review: review
        })

        metrika.review()
        await sendReview(visitorId, currentUser?.id, rating, review)
        await telegramSendFeedback(rating.toString(), review, currentUser?.name, currentUser?.phone, currentUser?.id)
    }

    const yaMaps = () => {
        window.open('https://yandex.ru/maps/-/CDToBSJD', '_blank')
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
                {!isRated && !isRatedStorage.isRated ? <Stack w='100%' align='center' justify='center' py={24} px={24} gap={16} >
                    <Text fz={24} fw={700} c='var(--portal-color-text)'>Оставьте отзыв</Text>
                    <Stack maw={450} w={'100%'} gap={12} align='center'>
                        <Paper radius={'md'} py={12} px={24} style={{ border: '1px solid rgb(86, 117, 75)' }} mt={12}>
                            <Group wrap='nowrap'>
                                <FaStar size={32} color='rgb(86, 117, 75)' />
                                <Text fz='md' fw={500} c='var(--portal-color-text)'>Пожалуйста, оставьте честный отзыв, для нас это очень важно</Text>
                            </Group>
                        </Paper>
                        {/* <Paper radius={'md'} py={12} px={24} style={{ border: '1px solid rgb(86, 117, 75)' }} mt={48}> */}
                        <Rating value={rating} onChange={setRating} size='xl' styles={{ starSymbol: { width: 48, height: 48 } }} my={12}
                            defaultValue={0}
                            defaultChecked={false}
                        />
                        {/* </Paper> */}
                        <Textarea
                            w={'100%'}
                            size="md"
                            radius="md"
                            label="Отзыв"
                            placeholder='Дополните вашу оценку отзывом'
                            minRows={3}
                            // @ts-ignore
                            onInput={(v) => setReview(v.target.value)}
                        />

                        <Button text='Отправить' stretch bgColor='#56754B' color='#fff' onClick={handleSaveRating} />
                    </Stack>
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
