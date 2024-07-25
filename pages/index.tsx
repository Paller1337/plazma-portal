import IndexNavButton from '@/components/IndexNavButton'
import NavBar from '@/components/NavBar'
import PromoSlider from '@/components/PromoSlider'
import StoriesModal from '@/components/Story'
import WelcomeScreen from '@/components/WelcomeScreen'
import { CardProps } from '@mantine/core'
import axios from 'axios'
import { useAuth } from 'context/AuthContext'
import { useOrders } from 'context/OrderContext'
import { DEFAULTS } from 'defaults'
import { axiosInstance } from 'helpers/axiosInstance'
import useIsPwa from 'helpers/frontend/pwa'
import { SECRET_KEY, decodeToken } from 'helpers/login'
import { getServiceOrdersByGuestId, servicesFromRes } from 'helpers/order/services'
import { formatTicketMessage, ticketStatus, ticketStatusColor } from 'helpers/support/tickets'
import { withAuthServerSideProps } from 'helpers/withAuthServerSideProps'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { WallWallpostFull } from 'node_modules/vk-io/lib/api/schemas/objects'
import React, { useEffect, useState } from 'react'
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
    categories?: {
        name: string,
        description: string,
        priorirty: number,
        articles: {
            id: number,
            title: string,
            description: string,
            content: string,
            image: string,
            preview_size: 'big' | 'std' | 'min',
            tag: string,
            short_desc: string,
        }[]
        stores: {
            id: number,
            title: string,
            description: string,
            image: string,
            preview_size: 'big' | 'std' | 'min',
            tag: string,
            short_desc: string,
        }[]
    }[]

}


export const getServerSideProps: GetServerSideProps = withAuthServerSideProps(async (context) => {
    try {

        const token = context.req.headers.cookie?.split('; ').find(c => c.startsWith('session_token='))?.split('=')[1]

        const cat = await axios.get(`${DEFAULTS.STRAPI.url}/api/categories`, {
            params: {
                'populate': 'deep,3',
            }
        })

        const categories = cat.data.data.map(c => ({
            name: c.attributes.name,
            description: c.attributes.description,
            priorirty: c.attributes.priority,
            articles: c.attributes.articles.data ? c.attributes.articles.data.map(a => ({
                id: a.id,
                title: a.attributes.title,
                description: a.attributes.description,
                content: a.attributes.content,
                image: a.attributes.image.data[0].attributes.url,
                preview_size: a.attributes.preview_size || 'min',
                tag: a.attributes.tag || '',
                short_desc: a.attributes.short_desc || '',
            })) : [],
            stores: c.attributes?.stores.data ? c.attributes?.stores.data.map(s => ({
                id: s.id,
                title: s.attributes.title,
                description: s.attributes?.description,
                image: s.attributes?.image.data.attributes.url,
                preview_size: s.attributes?.preview_size || 'min',
                tag: s.attributes?.tag || '',
                short_desc: s.attributes?.short_desc || '',
            })) : [],
        }))

        const vkPosts = (await axiosInstance('/api/slider')).data.posts
        return {
            props: {
                // orders: orders,
                slider: vkPosts,
                categories: categories,
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

interface MainCardProps {
    href?: string
    size: 'std' | 'min' | 'big'
    image: string
    title: string
    subtitle?: string
    tag?: string
}


export function MainCard(props: MainCardProps) {
    return (
        <Link href={props.href} className={`card-${props.size}`}>
            <div className='main-cards__item'>
                <div className='main-cards__item-image'>
                    {props.tag ? <span className='main-cards__item-tag'>{props.tag}</span> : <></>}
                    <img src={props.image} alt='' />
                </div>
                <div className='main-cards__item-text'>
                    <div className='main-cards__item-title'>{props.title}</div>
                    {props.subtitle ? <div className='main-cards__item-subtitle'>{props.subtitle}</div> : <></>}
                </div>
            </div>
        </Link>
    )
}

export default function IndexPage(props: IndexPageProps) {
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const { state } = useOrders()
    // @ts-ignore
    const orders: IServiceOrder[] = []
    const supportTicks: ISupportTicket[] = []
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

    const closeModal = () => {
        setModalIsOpen(false)
    }

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
        if (!wall) return
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
    // useEffect(() => console.log('categories ', props.categories), [])
    // useEffect(() => console.log('props ', props), [])

    // useEffect(() => {
    //     const fetch = async () => {

    //     }
    //     fetch()
    // }, [])
    // console.log('state: ', state)
    const workOrders = orders.filter(x => x.orderInfo.status !== 'done')
    // console.log('workOrders: ', workOrders)

    const openedTicks = supportTicks.filter(x => x.status !== 'closed')
    return (<>
        <div className='index-preview'>
            <img src='/images/welcome.png' alt='' />
        </div>

        <StoriesModal isOpen={modalIsOpen} onClose={closeModal} />

        <main className='swing-main'>
            <div className='index-header'>
                <div className='index-header__content'>
                    <span className='index-header__title'>Парк-отель Plazma</span>
                    <div className='index-header__avatar' onClick={() => setModalIsOpen(true)}>
                        <div className='index-header__avatar-gr' />
                        <div className='index-header__avatar-image'>
                            <img src='/images/logo.png' alt='' />
                        </div>
                    </div>
                </div>
            </div>
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

                {/* <IndexNavButton
                    title='Информация'
                    desc='Вопросы и ответы на них'
                    svgName='question'
                    link='/help#info'
                /> */}

                <IndexNavButton
                    title={openedTicks.length > 0 ? formatTicketMessage(openedTicks.length, true) : 'Помощь'}
                    desc={openedTicks.length > 0 ? ticketStatus(openedTicks[0]?.status) : 'Нет открытых заявок'}
                    status={openedTicks.length > 0 ? ticketStatusColor(openedTicks[0]?.status) : '#fff'}
                    svgName='help'
                    isHelpButton
                />
                <div className='index-nav__button-group'>
                    <div className='index-nav__button-cust'>
                        <ReactSVG src='/svg/vk.svg' />
                    </div>
                    <div className='index-nav__button-cust'>
                        <ReactSVG src='/svg/tg.svg' />
                    </div>
                    <div className='index-nav__button-cust'>
                        <ReactSVG src='/svg/star.svg' />
                        Оставить отзыв
                    </div>
                </div>
            </div>

            <div className='index-content'>
                {props.categories ? props.categories.sort((a, b) => a.priorirty - b.priorirty).map((category, i) => {
                    if (category?.articles?.length > 0 || category?.stores?.length > 0)
                        return (
                            <div key={category.name + i} className='index-content__category'>
                                {category.name && category.priorirty !== 0 ?
                                    <span className='index-content__category-title'>
                                        <span className='title'>{category.name}</span>
                                        {category.description ? <span className='description'>{category.description}</span> : <></>}
                                    </span>
                                    : <></>}
                                <div className='main-cards__wrapper'>
                                    {category.articles ? category.articles.map((article, j) =>
                                        <MainCard
                                            key={article.title + j}
                                            image={DEFAULTS.STRAPI.url + article.image}
                                            size={article.preview_size}
                                            title={article.title}
                                            subtitle={article.short_desc}
                                            tag={article.tag}
                                            href={`/article/${article.id}`}
                                        />
                                    ) : <></>}

                                    {category.stores ? category.stores.map((store, j) =>
                                        <MainCard
                                            key={store.title + j}
                                            image={DEFAULTS.STRAPI.url + store.image}
                                            size={store.preview_size}
                                            title={store.title}
                                            subtitle={store.short_desc}
                                            tag={store.tag}
                                            href={`/store/${store.id}`}
                                        />
                                    ) : <></>}
                                </div>
                            </div>
                        )
                }) : <></>}

            </div>
        </main >


        <NavBar page='index' />
    </>)
}