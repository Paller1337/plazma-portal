import IndexNavButton from '@/components/IndexNavButton'
import NavBar from '@/components/NavBar'
import PromoSlider from '@/components/PromoSlider'
import WelcomeScreen from '@/components/WelcomeScreen'
import { CardProps } from '@mantine/core'
import { BlocksRenderer } from '@strapi/blocks-react-renderer'
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
import { useRouter } from 'next/router'
import { WallWallpostFull } from 'node_modules/vk-io/lib/api/schemas/objects'
import { title } from 'process'
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

interface IArticle {
    title?: string
    description?: string
    text?: any
    content?: any
    image?: string
}
interface ArticlePageProps {
    article?: IArticle
    article2?: any
}

export const getServerSideProps: GetServerSideProps = withAuthServerSideProps(async (context) => {
    const { id } = context.params
    console.log('id ', id)
    try {
        const article = await axios.get(`${DEFAULTS.STRAPI.url}/api/articles/${id}`, {
            params: {
                'populate': 'deep,3',
            }
        })

        console.log('article  ', article.data)

        return {
            props: {
                // article: article.data,
                article: {
                    title: article.data.data.attributes.title || '',
                    description: article.data.data.attributes.description || '',
                    text: article.data.data.attributes.text || '',
                    content: article.data.data.attributes.content || '',
                    image: article.data.data.attributes.image.data[0].attributes.url || '',
                    preview_size: article.data.data.attributes.preview_size || 'min'
                }
            } as ArticlePageProps
        }
    } catch (error) {
        console.error('Ошибка при получении статьи:', error)
        return {
            props: {
                article: []
            } as ArticlePageProps
        }
    }
})


export default function IndexPage(props: ArticlePageProps) {
    const { state } = useOrders()
    const router = useRouter()
    // @ts-ignore

    useEffect(() => {
        console.log('props.article ', props.article)
        console.log('props.article2 ', props.article2)
    }, [])

    return (<>
        <div className='index-preview'>
            <div className='store-header'>
                <div className='store-header__content'>
                    <span className='back-button' onClick={() => router.back()}>
                        <ReactSVG src='/svg/arrowleft.svg' />
                    </span>
                </div>
            </div>
            <img src={`${DEFAULTS.STRAPI.url + props.article?.image}`} alt='' />
        </div>

        <main className='swing-main'>
            <div className='article-header'>
                <div className='article-header__content'>
                    <span className='article-header__title'>{props.article?.title}</span>
                </div>
            </div>

            <div className='article-content' dangerouslySetInnerHTML={{ __html: props.article?.content }}  >
                {/* <BlocksRenderer content={props.article?.text} /> */}
            </div>
        </main >
    </>)
}