import Button from '@/components/Button'
import { Group, Stack } from '@mantine/core'
import axios from 'axios'
import { useOrders } from 'context/OrderContext'
import { DEFAULTS } from 'defaults'
import { withAuthServerSideProps } from 'helpers/withAuthServerSideProps'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { ReactSVG } from 'react-svg'

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
    button?: {
        title: string
        link: string
        external: boolean
    }
}
interface ArticlePageProps {
    article?: IArticle
}

const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN

export const getServerSideProps: GetServerSideProps = withAuthServerSideProps(async (context) => {
    const { id } = context.params
    console.log('id ', id)
    try {
        const article = await axios.get(`${DEFAULTS.STRAPI.url}/api/articles/${id}`, {
            params: {
                'populate': 'deep,3',
            },
            headers: {
                ContentType: 'application/json',
                Authorization: `Bearer ${STRAPI_API_TOKEN}`,
            }
        })

        console.log('article  ', article.data)
        console.log('article title ', article.data.data.attributes.title)
        console.log('article button ', article.data.data.attributes.action_button)
        const action_button = article.data.data.attributes?.action_button.data
        const button = action_button ? {
            title: action_button?.attributes?.title,
            link: action_button?.attributes?.link,
            external: action_button?.attributes?.external,
        } : null
        console.log('button ', button)
        return {
            props: {
                // article: article.data,
                article: {
                    title: article.data.data.attributes.title || '',
                    description: article.data.data.attributes.description || '',
                    text: article.data.data.attributes.text || '',
                    content: article.data.data.attributes.content || '',
                    image: article.data.data.attributes.image.data[0].attributes.url || '',
                    preview_size: article.data.data.attributes.preview_size || 'min',
                    button: button ? button : { title: '', link: '', external: false },
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

            {props.article?.button && props.article?.button?.title ?
                <Stack px={12} align='center' mt={'40px'}>
                    <Group maw={400} w={'100%'}>
                        <Button
                            stretch
                            bgColor='#56754B'
                            text={props.article?.button?.title}
                            onClick={
                                () => router.push(
                                    props.article?.button?.link,
                                    null,
                                    { shallow: !props.article?.button?.external })
                            } />
                    </Group>
                </Stack>
                : <></>
            }
        </main >
    </>)
}