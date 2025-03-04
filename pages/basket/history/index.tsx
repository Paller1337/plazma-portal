import NavBar from '@/components/NavBar'
import Router, { useRouter } from 'next/router'
import OrderListItem from '@/components/OrderListItem'
// import { IServiceOrder } from 'types/order'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { GetServerSideProps } from 'next'
import { SECRET_KEY } from 'helpers/login'
import HeaderUnder from '@/components/HeaderUndex'
import { withAuthServerSideProps } from 'helpers/withAuthServerSideProps'
// import { useOrders } from 'context/OrderContext'
import { getOrdersByGuestId } from 'helpers/order/order'
import { IOrder } from 'types/order'
import { useOrders } from 'context/OrderContext'




interface BasketHistoryProps {
    orders?: IOrder[]
}

export const getServerSideProps: GetServerSideProps = withAuthServerSideProps(async (context) => {
    try {
        const token = context.req.headers.cookie?.split('; ').find(c => c.startsWith('session_token='))?.split('=')[1];
        if (!token) {
            // Обрабатываем случай, когда токен отсуствует
            return { props: {} };
        }
        const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload

        const orders = await getOrdersByGuestId(decoded.accountId)


        if (!orders) {
            throw new Error(`Заказов нет`);
        }

        // const orders: IServiceOrder[] = servicesFromRes(res)

        return {
            props: {
                orders: orders,
            } as BasketHistoryProps
        }
    } catch (error) {
        console.error('Ошибка при получении услуг:', error)
        return {
            props: {
                orders: []
            } as BasketHistoryProps
        }
    }
})


export default function OrderServices(props: BasketHistoryProps) {
    const { state } = useOrders()
    // @ts-ignore
    // useEffect(() => console.log('orders: ', state))
    return (<>
        <HeaderUnder title='Мои заказы' onClick={() => Router.back()} />
        <main className='--gray-main'>
            <div className='page-wrapper'>
                <div className='order-list'>
                    {props.orders?.length > 0 ? props.orders.sort((a, b) => b.id - a.id).map((x, i) =>
                        <OrderListItem
                            key={(x.id + x.create_at).toString()}
                            order={x}
                            orderContext={state.orders?.find(ord => parseInt(ord.id) === x.id)}
                        />
                    )
                        :
                        <div className='order-list__nothing'>У вас нет заказов</div>
                    }
                    {/* <Button onClick={fetch} text='Fetch' /> */}
                </div>
            </div>
        </main>
        <NavBar page={'basket/history'} />
    </>)
}