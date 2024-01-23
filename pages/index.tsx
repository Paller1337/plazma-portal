import IndexNavButton from '@/components/IndexNavButton'
import NavBar from '@/components/NavBar'
import PromoSlider from '@/components/PromoSlider'
import { useAuth } from 'context/AuthContext'
import { SECRET_KEY, decodeToken } from 'helpers/login'
import { getServiceOrdersByGuestId, servicesFromRes } from 'helpers/order/services'
import { withAuthServerSideProps } from 'helpers/withAuthServerSideProps'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { ReactSVG } from 'react-svg'
import { IServiceOrder } from 'types/order'

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

        return {
            props: {
                orders: orders,
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
    // const { isAuthenticated } = useAuth()
    // const router = useRouter()
    // useEffect(() => {
    //     if (!isAuthenticated) router.push('/auth')
    // }, [isAuthenticated, router])

    useEffect(() => {
        console.log('orders: ', props.orders)
    }, [])

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
      

    return (<>
        <main>
            <PromoSlider slides={slides} />

            {props.orders.length > 0 ?
                <div className='index-nav index-orders'>
                    <IndexNavButton
                        title={formatOrderMessage(props.orders.length)}
                        desc='Ваш заказ в работе'
                        orderStatus={props.orders[0].orderInfo.status}
                        svgName='order'
                        isOrderButton
                    />
                </div>
                :
                <></>
            }

            <div className='index-nav'>
                <IndexNavButton
                    title='Навигация'
                    desc='Карта парк-отеля'
                    svgName='map'
                />

                <IndexNavButton
                    title='Информация'
                    desc='Вопросы и ответы на них'
                    svgName='question'
                    link='/help'
                />

                <IndexNavButton
                    title='Помощь'
                    desc='Ваша заявка в очереди'
                    status='#f23'
                    svgName='help'
                    isHelpButton
                />
            </div>
        </main>


        <NavBar page='index' />
    </>)
}