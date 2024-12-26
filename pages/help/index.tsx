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
import { LoadingOverlay, Select, Textarea } from '@mantine/core'
import Button from '@/components/Button'
import toast from 'react-hot-toast'
import { formatTicketMessage, getSupportTicketsByGuestId, ticketStatus } from 'helpers/support/tickets'
import { DateTime } from 'luxon'
import { getGuestAccountByBookingId, getGuestAccountById } from 'helpers/session/guestAccount'
import Cookies from 'js-cookie'
import { axiosInstance } from 'helpers/axiosInstance'
import SupportTicketSendModal from '@/components/SupportTicketSendModal'
import { ISupportTicket, TSupportTicketStatus } from 'types/support'
import { useOrders } from 'context/OrderContext'
import { useCart } from 'context/CartContext'
import { telegramSendTicket } from 'helpers/telegram'
import { notify } from 'utils/notify'
import { RiErrorWarningLine } from "react-icons/ri"
import { FaCheckCircle } from 'react-icons/fa'
import { metrika } from 'utils/metrika'

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
    const { currentUser, isAuthenticated, openAuthModal } = useAuth()
    const { hotelRooms } = useCart()
    const [supportComment, setSupportComment] = useState('')
    const [supportFormClicked, setSupportFormClicked] = useState(false)
    const [visibleLoadingOverlay, setVisibleLoadingOverlay] = useState(false)
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const closeModal = () => setModalIsOpen(false)
    const router = useRouter()

    const { state } = useOrders()
    // @ts-ignore
    const tickets: ISupportTicket[] = state.tickets

    const rooms = hotelRooms?.map(room => ({
        value: room.meta_system_id.toString(),
        label: room.name
    }))

    const placeTicket = async (ticketData) => {
        try {
            const response = await axiosInstance.post('/api/ticket/create', ticketData)
            if (response.status === 200) {
                // console.log('Ticket placed successfully:', response.data)
                return { data: response.data, status: true }
            } else {
                console.error('Error placing ticket:', response.data)
                return { data: response.data, status: false }
            }
        } catch (error) {
            console.error('Error placing ticket:', error)
            return { data: null, status: false }
        }
    }

    const [room, setRoom] = useState({
        value: '',
        label: '',
        error: '',
    })

    const sendSupportTicket = async () => {
        setSupportFormClicked(true)

        if (!currentUser.approved) {
            notify({
                icon: <RiErrorWarningLine />,
                title: 'Заявка не отправлена.',
                message: 'Ваш аккаунт заблокирован. Вы не можете отправлять заявки.',
            })
            return
        }

        if (supportComment.length < 10 || visibleLoadingOverlay) return

        if (!room.label || !room.value) {
            setRoom(p => ({
                ...p,
                error: 'Выберите комнату'
            }))
        }

        if (!room.label || !room.value) return


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
            // console.log('guestAccount: ', guestAccount)
            // console.log('ticket time: ', nowTime)
            // console.log('ticket message: ', supportComment)

            try {
                // const response = await sendOrderToTelegram(state); // Предполагается, что здесь вызывается функция отправки заказа
                // const responseStrapi = await createSupportTicket({
                //     // create_at: nowTime,
                //     // update_at: nowTime,
                //     // status: 'new',
                //     // previous_status: 'new',
                //     customer: {
                //         name: guestAccount.attributes.firstName,
                //         phone: guestAccount.attributes.phone,
                //         room: guestAccount.attributes.roomId,
                //         guest_account: guestAccount.id,
                //     },
                //     // messages: [{
                //     //     create_at: nowTime,
                //     //     sender: guestAccount.attributes.firstName,
                //     //     sender_type: 'guest',
                //     //     message: supportComment
                //     // }]

                // })

                const ticketIsPlace = await placeTicket({
                    guest: currentUser.id, // ID гостя
                    create_at: nowTime,
                    update_at: nowTime,
                    status: 'new',
                    previous_status: 'new',
                    messages: [{
                        create_at: nowTime,
                        sender: guestAccount.attributes.name,
                        sender_type: 'guest',
                        message: supportComment
                    }],
                    room: {
                        label: room.label,
                        roomId: room.value,
                    },
                })

                if (!ticketIsPlace.status) return
                const tickets = await getSupportTicketsByGuestId(currentUser.id)
                const targetTicket = tickets.find(o => o.id === ticketIsPlace.data.data.id)

                const response = await telegramSendTicket(targetTicket).then(res => {
                    // console.log({ res })
                    return res
                })

                // const ticketToTelegram = {
                //     id: ticketIsPlace.data.data.id,
                //     time: DateTime.fromISO(nowTime).toLocaleString(DateTime.DATETIME_MED),
                //     messages: [{
                //         create_at: nowTime,
                //         sender: guestAccount.attributes.name,
                //         sender_type: 'guest',
                //         message: supportComment
                //     }],
                //     guest: guestAccount?.attributes.name
                // }

                // const response = await sendOrderToTelegram(orderToTelegram) // Предполагается, что здесь вызывается функция отправки заказа
                if (response && ticketIsPlace) {
                    metrika.supportTicket()
                    notify({
                        icon: <FaCheckCircle />,
                        title: 'Заявка отправлена!',
                        message: 'Спасибо за обращение.',
                    })
                    setModalIsOpen(true)
                    setVisibleLoadingOverlay(false)
                    setSupportComment('')
                    setSupportFormClicked(false)
                    // console.log('responseStrapi: ', responseStrapi)
                }
            } catch (error) {
                notify({
                    icon: <RiErrorWarningLine />,
                    title: 'Заявка не отправлена.',
                    message: 'Ошибка при отправке заявки.',
                })
                setVisibleLoadingOverlay(false)
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
                    {tickets && tickets.length > 0 && tickets?.filter(t => t.status !== 'closed').length > 0 ?
                        <div className={`support-status ${tickets[0].status ? `--status-${tickets[0].status}` : ''}`}>
                            <div className='support-status__bg'>
                                <ReactSVG src={`/svg/nav/help-light.svg`} />
                            </div>

                            <div className='support-status__info'>
                                <span className='support-status__title'>{formatTicketMessage(tickets?.filter(t => t.status !== 'closed').length)}</span>
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
                            <Select
                                label='Номер проживания'
                                mb={'md'}
                                size='md'
                                radius={'md'}
                                comboboxProps={{ withinPortal: true }}
                                data={rooms}
                                placeholder="Комната"
                                searchable
                                onChange={value => setRoom(() => ({
                                    value: value,
                                    label: rooms.find(x => x.value === value)?.label,
                                    error: '',
                                }))}
                                error={room.error}
                            />

                            <Button
                                text={isAuthenticated ? 'Отправить заявку' : 'Войти и отправить заявку'}
                                stretch onClick={isAuthenticated ? () => sendSupportTicket() : () => openAuthModal()}
                            />
                        </div>
                    </div>
                    <span id='info' className='faq-title'>Часто задаваемые вопросы</span>
                    <div className='faq-list'>
                        {props.faqs?.length ? props.faqs?.map((x, i) => (
                            <FAQCard key={x.attributes.question + i} question={x.attributes.question} answer={x.attributes.answer} />
                        )) : <></>}
                    </div>
                </div>
            </div>
        </main>


        <NavBar page='help' />
    </>)
}