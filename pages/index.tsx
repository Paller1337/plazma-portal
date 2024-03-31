import IndexNavButton from '@/components/IndexNavButton'
import NavBar from '@/components/NavBar'
import PromoSlider from '@/components/PromoSlider'
import WelcomeScreen from '@/components/WelcomeScreen'
import { useAuth } from 'context/AuthContext'
import { useOrders } from 'context/OrderContext'
import { axiosInstance } from 'helpers/axiosInstance'
import useIsPwa from 'helpers/frontend/pwa'
import { SECRET_KEY, decodeToken } from 'helpers/login'
import { getServiceOrdersByGuestId, servicesFromRes } from 'helpers/order/services'
import { formatTicketMessage, ticketStatus, ticketStatusColor } from 'helpers/support/tickets'
import { withAuthServerSideProps } from 'helpers/withAuthServerSideProps'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { WallWallpostFull } from 'node_modules/vk-io/lib/api/schemas/objects'
import { useEffect, useState } from 'react'
import { ReactSVG } from 'react-svg'
import { IServiceOrder, TOrderStatus } from 'types/order'
import { ISupportTicket } from 'types/support'

const slides = [
    {
        title: 'Скидка 20% на доставку',
        desc: 'Акция распространяется на мясные блюда и действительна до 3 января 16:00.',
        img: '/images/promo/slide-1.png',
        btn: {
            name: 'Подробнее',
            link: '/',
        }
    },
    {
        title: 'Скидка 15% на доставку',
        desc: 'Акция распространяется на мясные блюда и действительна до 3 января 16:00.',
        img: '/images/promo/slide-1.png',
        btn: {
            name: 'Подробнее',
            link: '/',
        }
    },
    {
        title: 'Скидка 10% на доставку',
        desc: 'Акция распространяется на мясные блюда и действительна до 3 января 16:00.',
        img: '/images/promo/slide-1.png',
        btn: {
            name: 'Подробнее',
            link: '/',
        }
    },
]

interface IndexPageProps {
    orders?: IServiceOrder[]
    slider?: WallWallpostFull[]
}

export const getServerSideProps: GetServerSideProps = withAuthServerSideProps(async (context) => {
    try {

        const token = context.req.headers.cookie?.split('; ').find(c => c.startsWith('session_token='))?.split('=')[1];

        if (!token) {
            return { props: {} };
        }
        const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload
        const res = await getServiceOrdersByGuestId(decoded.accountId)

        if (!res) {
            throw new Error(`Заказов нет`);
        }

        const orders: IServiceOrder[] = servicesFromRes(res)

        const vkPosts = (await axiosInstance('/api/slider')).data.posts
        return {
            props: {
                orders: orders,
                slider: vkPosts,
            } as IndexPageProps
        }
    } catch (error) {
        console.error('Ошибка при получении услуг:', error)
        return {
            props: {
                orders: []
            } as IndexPageProps
        }
    }
})

export default function IndexPage(props: IndexPageProps) {
    const { state } = useOrders()
    // @ts-ignore
    const orders: IServiceOrder[] = state.service_orders
    const supportTicks: ISupportTicket[] = state.support_tickets
    const [sliderData, setSliderData] = useState(null)

    function formatOrderMessage(orderCount) {
        let orderWord = 'заказов';
        let activeWord = 'активных';

        if (orderCount % 10 === 1 && orderCount % 100 !== 11) {
            orderWord = 'заказ';
            activeWord = 'активный';
        } else if (orderCount % 10 >= 2 && orderCount % 10 <= 4 && (orderCount % 100 < 10 || orderCount % 100 >= 20)) {
            orderWord = 'заказа';
            activeWord = 'активных';
        }
        return `У вас ${orderCount} ${activeWord} ${orderWord}`;
    }

    const orderStatus = (s: TOrderStatus) => {
        switch (s) {
            case 'new':
                return 'Ваш заказ обрабатывается'
            case 'inwork':
                return 'Ваш заказ в работе'
            case 'delivered':
                return 'Ваш заказ доставляется'
            case 'done':
                return 'Ваш заказ готов'
            default:
                return ''
        }
    }

    console.log('SLIDER POSTS: ', props.slider)

    function parseWallText(text) {
        const headPattern = /H: (.*?)(?=\n|$)/
        const bodyPattern = /B: (.*?)(?=\n|$)/
        const linkPattern = /L: (\S+)/

        const headMatch = text.match(headPattern)
        const bodyMatch = text.match(bodyPattern)
        const linkMatch = text.match(linkPattern)

        return {
            head: headMatch ? headMatch[1] : '',
            body: bodyMatch ? bodyMatch[1] : '',
            link: linkMatch ? linkMatch[1] : ''
        }
    }

    const findSlides = (wall: WallWallpostFull[]) => {
        if(!wall) return
        return wall.map(post => ({
            img: post.attachments.filter(att => att.type == 'photo')[0].photo.sizes.filter(size => size.height > 300 && size.width > 600)[0].url,
            // text: post.text,
            title: parseWallText(post.text).head,
            desc: parseWallText(post.text).body,
            btn: {
                name: 'Открыть',
                link: parseWallText(post.text).link
            },
        }))
    }
    useEffect(() => setSliderData(() => findSlides(props.slider)), [])

    console.log('state: ', state)
    const workOrders = orders.filter(x => x.orderInfo.status !== 'done')
    console.log('workOrders: ', workOrders)

    const openedTicks = supportTicks.filter(x => x.status !== 'closed')
    return (<>
        <main>
            <PromoSlider slides={sliderData} />

            {workOrders.length > 0 ?
                <div className='index-nav index-orders'>
                    <IndexNavButton
                        title={formatOrderMessage(workOrders.length)}
                        desc={orderStatus(workOrders[0].orderInfo.status)}
                        orderStatus={workOrders[0].orderInfo.status}
                        svgName='order'
                        isOrderButton
                    />
                </div>
                :
                <></>
            }

            <div className='index-nav'>
                {/* <IndexNavButton
                    title='Навигация'
                    desc='Карта парк-отеля'
                    svgName='map'
                /> */}

                <IndexNavButton
                    title='Информация'
                    desc='Вопросы и ответы на них'
                    svgName='question'
                    link='/help#info'
                />

                <IndexNavButton
                    title={openedTicks.length > 0 ? formatTicketMessage(openedTicks.length, true) : 'Помощь'}
                    desc={openedTicks.length > 0 ? ticketStatus(openedTicks[0]?.status) : 'Нет открытых заявок'}
                    status={openedTicks.length > 0 ? ticketStatusColor(openedTicks[0]?.status) : '#fff'}
                    svgName='help'
                    isHelpButton
                />
            </div>
        </main>


        <NavBar page='index' />
    </>)
}