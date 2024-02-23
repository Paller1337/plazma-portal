import IndexNavButton from '@/components/IndexNavButton'
import NavBar from '@/components/NavBar'
import { useAuth } from 'context/AuthContext'
import { getFAQList } from 'helpers/faq'
import { withAuthServerSideProps } from 'helpers/withAuthServerSideProps'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { ReactSVG } from 'react-svg'
import { BlocksRenderer } from '@strapi/blocks-react-renderer'
import { LoadingOverlay, Textarea } from '@mantine/core'
import Button from '@/components/Button'
import toast from 'react-hot-toast'
import { createSupportTicket, formatTicketMessage, ticketStatus } from 'helpers/support/tickets'
import { DateTime } from 'luxon'
import { getGuestAccountByBookingId, getGuestAccountById } from 'helpers/session/guestAccount'
import Cookies from 'js-cookie'
import { axiosInstance } from 'helpers/axiosInstance'
import SupportTicketSendModal from '@/components/SupportTicketSendModal'
import { ISupportTicket, TSupportTicketStatus } from 'types/support'
import { useOrders } from 'context/OrderContext'


interface HelpPageProps {
    faqs: any
}

export const getServerSideProps: GetServerSideProps = withAuthServerSideProps(async (context) => {
    try {
        const faqs = await getFAQList()
        return {
            props: {
                faqs: faqs
            } as HelpPageProps
        }
    } catch (error) {
        console.error('Ошибка ...:', error)
        return {
            props: {}
        }
    }
})

interface FAQCardProps {
    question?: string
    answer?: any[]
}
const FAQCard = (props: FAQCardProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const toggle = () => setIsOpen(isOpen => !isOpen)
    return (
        <div className='faq-card'>
            <div className='faq-card__header' onClick={toggle} >
                <span className='faq-card__question'>
                    {props.question}
                </span>
                <ReactSVG className='faq-card__toggle' src={'/svg/faq-plus.svg'} />
            </div>

            <div className={`faq-card__content${!isOpen ? ' closed' : ''}`}>
                <BlocksRenderer content={props.answer} />
            </div>
        </div>
    )
}

export default function HelpPage(props: HelpPageProps) {
    const [supportComment, setSupportComment] = useState('')
    const [supportFormClicked, setSupportFormClicked] = useState(false)
    const [visibleLoadingOverlay, setVisibleLoadingOverlay] = useState(false)
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const closeModal = () => setModalIsOpen(false)
    const router = useRouter()

    const { state } = useOrders()
    // @ts-ignore
    const tickets: ISupportTicket[] = state.support_tickets


    const sendSupportTicket = async () => {
        setSupportFormClicked(true)
        if (supportComment.length < 10 || visibleLoadingOverlay) return

        setVisibleLoadingOverlay(true)
        const token = Cookies.get('session_token')
        const res = await axiosInstance.post('/api/token/decode', {
            token
        })
        if (res.status === 200) {
            const decoded = res.data

            const guestAccount = await getGuestAccountById(decoded.accountId)

            // const serviceOrder = state.services.items.map(x => ({ service: parseInt(x.id), quantity: x.quantity }))
            const nowTime = DateTime.now().toISO()
            console.log('guestAccount: ', guestAccount)
            console.log('ticket time: ', nowTime)
            console.log('ticket message: ', supportComment)

            try {
                // const response = await sendOrderToTelegram(state); // Предполагается, что здесь вызывается функция отправки заказа
                const responseStrapi = await createSupportTicket({
                    create_at: nowTime,
                    update_at: nowTime,
                    status: 'new',
                    previous_status: 'new',
                    customer: {
                        name: guestAccount.attributes.firstName,
                        phone: guestAccount.attributes.phone,
                        room: guestAccount.attributes.roomId,
                        guest_account: guestAccount.id,
                    },
                    messages: [{
                        create_at: nowTime,
                        sender: guestAccount.attributes.firstName,
                        sender_type: 'guest',
                        message: supportComment
                    }]

                })

                // if (response.message) {
                //     console.log('serviceOrder: ', serviceOrder)
                // }

                if (responseStrapi) {
                    toast.success('Заявка отправлена!')
                    setModalIsOpen(true)
                    setVisibleLoadingOverlay(false)
                    setSupportComment('')
                    setSupportFormClicked(false)
                    console.log('responseStrapi: ', responseStrapi)
                }
            } catch (error) {
                toast.error('Ошибка при отправке заказа.')
            }
        }
    }

    useEffect(() => {
        console.log(props.faqs[0])
    }, [props.faqs])


    return (<>
        <LoadingOverlay
            visible={visibleLoadingOverlay}
            zIndex={1000}
            overlayProps={{ radius: 'sm', blur: 2 }}
            loaderProps={{ color: 'gray', type: 'oval' }}
        />

        <SupportTicketSendModal isOpen={modalIsOpen} onClose={closeModal} />
        <main className='--gray-main'>
            <div className='page-wrapper'>
                <div className='help-content'>
                    {tickets && tickets.length > 0 ?
                        <div className={`support-status ${tickets[0].status ? `--status-${tickets[0].status}` : ''}`}>
                            <div className='support-status__bg'>
                                <ReactSVG src={`/svg/nav/help-light.svg`} />
                            </div>

                            <div className='support-status__info'>
                                <span className='support-status__title'>{formatTicketMessage(tickets.length)}</span>
                                <span className='support-status__desc'>{ticketStatus(tickets[0].status)}</span>
                            </div>
                            <div className='support-status__btn' onClick={() => router.push('/help/history')}>
                                Мои заявки
                            </div>
                        </div>
                        : <></>}

                    <div className='support-form'>
                        <div className='support-form__heading'>
                            <span className='support-form__title'>Мне нужна помощь!</span>
                        </div>
                        <div className='support-form__text-wrap'>
                            <span className='support-form__text'>
                                Если вы столкнулись с трудностями или у вас возникли вопросы вы
                                всегда можете обратиться к администратору по номеру:
                            </span>
                            <span className='support-form__text bold'>
                                +7 (910) 168-17-61
                            </span>
                        </div>

                        <div className='support-form__text-wrap'>
                            <span className='support-form__text'>
                                Или заполнить заявку:
                            </span>

                            <Textarea
                                size="md"
                                radius="md"
                                placeholder='Ваш комментарий'
                                value={supportComment}
                                // @ts-ignore
                                onInput={(v) => setSupportComment(v.target.value)}
                            />
                            {supportComment.length < 10 && supportFormClicked ?
                                <span className='support-form__length-alert'>Минимальная длина обращения 10 символов</span>
                                : <></>
                            }
                            <Button text='Отправить заявку' stretch onClick={sendSupportTicket} />
                        </div>
                    </div>
                    <span id='info' className='faq-title'>Часто задаваемые вопросы</span>
                    <div className='faq-list'>
                        {props.faqs.length ? props.faqs.map((x, i) => (
                            <FAQCard key={x.attributes.question + i} question={x.attributes.question} answer={x.attributes.answer} />
                        )) : <></>}
                    </div>
                </div>
            </div>
        </main>


        <NavBar page='help' />
    </>)
}