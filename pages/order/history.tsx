import NavBar from '@/components/NavBar'
import Router, { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from 'context/AuthContext'
import OrderListItem from '@/components/OrderListItem'
import { IServiceOrder } from 'types/order'
import { getServiceOrdersByGuestId, servicesFromRes } from 'helpers/order/services'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { GetServerSideProps } from 'next'
import { SECRET_KEY } from 'helpers/login'
import HeaderUnder from '@/components/HeaderUndex'
import { withAuthServerSideProps } from 'helpers/withAuthServerSideProps'




interface OrderServicesProps {
    orders?: IServiceOrder[]
}

export const getServerSideProps: GetServerSideProps = withAuthServerSideProps(async (context) => {
    try {
        const token = context.req.headers.cookie?.split('; ').find(c => c.startsWith('session_token='))?.split('=')[1];
        if (!token) {
            // Обрабатываем случай, когда токен отсуствует
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
            } as OrderServicesProps
        }
    } catch (error) {
        console.error('Ошибка при получении услуг:', error)
        return {
            props: {
                orders: []
            } as OrderServicesProps
        }
    }
})


export default function OrderServices(props: OrderServicesProps) {
    // const { isAuthenticated } = useAuth()
    // const router = useRouter()
    // useEffect(() => {
    //     if (!isAuthenticated) router.push('/auth')
    // }, [isAuthenticated, router])


    return (<>
        <HeaderUnder title='Мои заказы' onClick={() => Router.back()} />
        <main className='--gray-main'>
            <div className='page-wrapper'>
                <div className='order-list'>
                    {props.orders ? props.orders.map((x, i) =>
                        <OrderListItem key={(x.id + x.orderInfo.createAt).toString()} order={x} />
                    )
                        :
                        <>У вас нет заказов</>
                    }
                </div>
            </div>
        </main>
        <NavBar page={'order/history'} />
    </>)
}