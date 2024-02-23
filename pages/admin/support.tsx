import ServiceOrder from '@/components/admin/ServiceOrder'
import { Flex } from '@mantine/core'
import { getRooms } from 'helpers/bnovo/getRooms'
import { GetServerSideProps } from 'next'
import { useEffect, useState } from 'react'
import { IServiceOrder, TOrderStatus } from 'types/order'
import { useAdminOrders } from 'context/admin/OrderContext'
import { useRouter } from 'next/router'
import SupportTicket from '@/components/admin/SupportTicketCard'
import { ISupportTicket, TSupportTicketStatus } from 'types/support'

interface AdminSupportPageProps {
    rooms?: any
}

export interface ISupportTicketWithEntering extends ISupportTicket {
    isEntering?: boolean
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        const rooms = await getRooms()

        if (!rooms) {
            throw new Error(`Комнат нет`)
        }
        return {
            props: {
                rooms: rooms,
            }
        };
    } catch (error) {
        console.error('Ошибка:', error);
        return { props: { orders: [], rooms: [] } };
    }
}
interface PageNavItemProps {
    isActive?: boolean
    name: string
    count: number
    onClick?: () => void
}

type TNavItem = {
    status: TSupportTicketStatus,
    name: string,
    count: number
}

const PageNavItem = (props: PageNavItemProps) => {

    return (
        <div className={`admin-page--pageNav__item ${props.isActive ? 'active' : ''}`}
            onClick={props.onClick}>

            {props.name}
            <div className='admin-page--pageNav__item-counter'>{props.count}</div>
        </div>
    )
}

export default function AdminServicesPage(props: AdminSupportPageProps) {
    const [currentNav, setCurrentNav] = useState<TSupportTicketStatus>('new')
    const hotelRooms = props.rooms?.filter(x => x.tags !== '')
    const { state } = useAdminOrders()
    const [tickets, setTickets] = useState<ISupportTicketWithEntering[]>(state.support_tickets)

    const router = useRouter()
    const query = router.query


    const navItems: TNavItem[] = [
        { status: 'new', name: 'Новые', count: state.support_tickets.filter(x => x.status === 'new').length },
        { status: 'inwork', name: 'В работе', count: state.support_tickets.filter(x => x.status === 'inwork').length },
        { status: 'closed', name: 'Завершенные', count: state.support_tickets.filter(x => x.status === 'closed').length }
    ]

    const loadTickets = (status: TSupportTicketStatus) => {
        let tmporders
        switch (status) {
            case 'closed':
                tmporders = state.support_tickets.filter(x => x.status === 'closed')
                setTickets(tmporders)
                break
            case 'inwork':
                tmporders = state.support_tickets.filter(x => x.status === 'inwork')
                setTickets(tmporders)
                break;
            case 'new':
                tmporders = state.support_tickets.filter(x => x.status === 'new')
                setTickets(tmporders)
                break
            default:
                tmporders = state.support_tickets.filter(x => x.status === 'new')
                setTickets(tmporders)
                break
        }
    }

    const changeTab = (newStatus: TSupportTicketStatus) => {
        setCurrentNav(newStatus)
        router.push(`/admin/support?status=${newStatus}`, undefined, { shallow: true });
    }

    useEffect(() => {
        setTickets(state.support_tickets)
        console.log('Tickets: ', state.support_tickets)
        loadTickets((query.status as string) as TSupportTicketStatus)
    }, [state.support_tickets, query.status])

    return (
        <>
            <main className='admin-page'>
                <Flex
                    direction={'column'}
                    gap={12}
                >
                    <div className='admin-page--pageNav'>
                        {navItems.map(x =>
                            <PageNavItem
                                key={x.name}
                                count={x.count}
                                name={x.name}
                                isActive={currentNav === x.status}
                                onClick={() => changeTab(x.status)}
                            />
                        )}
                    </div>

                    <div className='admin-serviceCards'>
                        {tickets.map((ticket, i) => {
                            const serviceRoom = hotelRooms.find(x => x.id === ticket.customer?.room)?.tags
                            const orderClass = `service-order ${ticket.isEntering ? 'service-order-enter' : ''}`
                            // console.log('Заказ ', service.orderInfo.customer.name, 'Комната: ', serviceRoom)
                            return (
                                <div className={`service-order ${orderClass}`} key={ticket.id}>
                                    <SupportTicket
                                        key={`sprt-${ticket.id}`}
                                        id={ticket.id}
                                        ticket={ticket}
                                        roomName={serviceRoom}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </Flex>
            </main>
        </>
    )
}