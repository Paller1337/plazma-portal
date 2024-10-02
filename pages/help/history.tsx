import NavBar from '@/components/NavBar'
import Router, { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from 'context/AuthContext'
import OrderListItem from '@/components/OrderListItem'
// import { IServiceOrder } from 'types/order'
// import { getServiceOrdersByGuestId, servicesFromRes } from 'helpers/order/services'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { GetServerSideProps } from 'next'
import { SECRET_KEY } from 'helpers/login'
import HeaderUnder from '@/components/HeaderUndex'
import { withAuthServerSideProps } from 'helpers/withAuthServerSideProps'
import { useOrders } from 'context/OrderContext'
import { ISupportTicket } from 'types/support'
import SupportTicketItem from '@/components/SupportTicketListItem'
import { Loader } from '@mantine/core'




interface SupportTicketsProps {
    tickets?: ISupportTicket[]
}

export const getServerSideProps: GetServerSideProps = withAuthServerSideProps(async (context) => {
    try {
        const token = context.req.headers.cookie?.split('; ').find(c => c.startsWith('session_token='))?.split('=')[1];
        if (!token) {
            // Обрабатываем случай, когда токен отсуствует
            return { props: {} }
        }
        const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload

        return {
            props: {} as SupportTicketsProps
        }
    } catch (error) {
        console.error('Ошибка при получении услуг:', error)
        return {
            props: {
                orders: []
            } as SupportTicketsProps
        }
    }
})


export default function SupportTickets(props: SupportTicketsProps) {
    const { state, ticketsIsLoading } = useOrders()
    const tickets = state.tickets
    useEffect(() => console.log('tickets: ', state))
    return (<>
        <HeaderUnder title='Мои заявки' onClick={() => Router.back()} />
        <main className='--gray-main'>
            <div className='page-wrapper'>
                <div className='order-list'>
                    {ticketsIsLoading ? <Loader color='gray' size={24} style={{margin: '48px auto'}} /> :
                        tickets?.length > 0 ? tickets.sort((a, b) => b.id - a.id).map((x, i) =>
                            <SupportTicketItem key={(x.id + x.create_at).toString()} ticket={x} />
                        )
                            :
                            <div className='order-list__nothing'>У вас нет заявок</div>
                    }
                </div>
            </div>
        </main>
        <NavBar page={'help'} />
    </>)
}