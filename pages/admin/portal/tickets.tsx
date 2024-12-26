import AdminWrapper from '@/components/admin/AdminWrapper'
import HelpDesk from '@/components/admin/HelpOrder'
import ServiceOrder from '@/components/admin/ServiceOrder'
import { Grid, Input, Loader, SegmentedControl } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { useAdminOrders } from 'context/admin/OrderContext'
import { getRooms, IHotelRoom } from 'helpers/bnovo/getRooms'
import { withAdminAuthServerSideProps } from 'helpers/withAdminAuthServerSideProps'
import { withAdminPage } from 'helpers/withAdminPage'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next/types'
import { useEffect, useState } from 'react'
import { TOrderStatus } from 'types/order'
import { ISupportTicket, TSupportTicketStatus } from 'types/support'


interface ProductsServicesPageProps {
}

export const getServerSideProps: GetServerSideProps = withAdminAuthServerSideProps(async (context) => {
    try {
        return {
            props: {
            }
        };
    } catch (error) {
        console.error('Ошибка:', error);
        return { props: { orders: [] } };
    }
}, ['admin', 'moderator'])

type TNavItem = {
    status?: TSupportTicketStatus,
    name: string,
    count: number
}

const groupTicketsByDate = (tickets: ISupportTicket[]) => {
    return tickets.reduce((groups, tickets) => {
        // Преобразуем дату создания заказа в объект DateTime и форматируем в строку 'yyyy-MM-dd'
        const date = DateTime.fromISO(tickets.create_at).toFormat('yyyy-MM-dd')
        if (!groups[date]) {
            groups[date] = []
        }
        groups[date].push(tickets)
        return groups
    }, {})
}

function ProductsServicesPage(props: ProductsServicesPageProps) {
    const [currentNav, setCurrentNav] = useState<TSupportTicketStatus>('new')
    const router = useRouter()
    const { state } = useAdminOrders()
    const [tickets, setTickets] = useState(state.tickets)
    const groupedTickets = groupTicketsByDate(tickets)

    const query = router.query
    const nowDate = DateTime.now()

    const navItems: TNavItem[] = [
        { status: 'null', name: 'Все', count: state.tickets.length },
        { status: 'new', name: 'Новые', count: state.tickets.filter(x => x.status === 'new').length },
        { status: 'inwork', name: 'В работе', count: state.tickets.filter(x => x.status === 'inwork').length },
        { status: 'closed', name: 'Закрыты', count: state.tickets.filter(x => x.status === 'closed').length },
    ]

    const loadTickets = (status?: TSupportTicketStatus) => {
        let tmporders
        switch (status) {
            case 'closed':
                tmporders = state.tickets.filter(x => x.status === 'closed')
                setTickets(tmporders)
                break

            case 'inwork':
                tmporders = state.tickets.filter(x => x.status === 'inwork')
                setTickets(tmporders)
                break;

            case 'new':
                tmporders = state.tickets.filter(x => x.status === 'new')
                setTickets(tmporders)
                break

            case 'null':
                tmporders = state.tickets
                setTickets(tmporders)
                break

            default:
                tmporders = state.tickets
                setTickets(tmporders)
                break
        }
    }


    const changeTab = (newStatus: TSupportTicketStatus) => {
        setCurrentNav(newStatus)
        router.push(`/admin/portal/tickets?status=${newStatus}`, undefined, { shallow: true });
    }

    useEffect(() => {
        setTickets(state.tickets)
        loadTickets((query.status as string) as TSupportTicketStatus)
    }, [state.tickets, query.status])
    return (
        <>
            <div className='admin--order'> {/* На данный момент стилей нет */}
                <div className='admin--order__header'>
                    <div className='admin--order__header-content'>
                        <span className='admin--order__header-title'>Заявки на поддержку</span>
                        <div className='admin--order__header-filters'>
                            <SegmentedControl
                                color="#262E4A"
                                data={navItems.map(x => ({ value: x.status, label: `${x.name} ${x.count}` }))}
                                radius={'md'}
                                size='md'
                                onChange={changeTab}
                            />
                            <Input
                                placeholder="Поиск..."
                                rightSection={<IconSearch size={16} />}
                                radius={'md'}
                                size='md'
                            />
                        </div>
                    </div>
                    <div className='admin-main__vs' />
                </div>

                {tickets.length > 0 ?
                    <div className='admin--order__opd-wrapper'>
                        {Object.keys(groupedTickets).map((date, i) => (
                            <div key={i} className='admin--order__opd'>
                                <div className='admin--order__opd-header'>
                                    <div className='admin--order__opd-content'>
                                        <span className='admin--order__opd-title'>Заказы за
                                            <span className='date'>
                                                {nowDate.toSQLDate().toString() === date ? ' сегодня' :
                                                    nowDate.minus({ day: 1 }).toSQLDate().toString() === date ? ' вчера' :
                                                        ' ' + DateTime.fromSQL(date).toLocaleString(DateTime.DATE_HUGE)}
                                            </span>
                                        </span>
                                    </div>
                                    <div className='admin-main__vs' />
                                </div>
                                <Grid px={24} mt={24} mb={48}>
                                    {groupedTickets[date].map((ticket: ISupportTicket) => (
                                        <HelpDesk
                                            key={'order-in-list-' + ticket.id}
                                            ticket={ticket}
                                            isVisualNew={ticket.isVisualNew}
                                        />
                                    ))}
                                </Grid>
                            </div>
                        ))}
                    </div>
                    :
                    <div className='admin--order__loader'><Loader size={48} color={'#485066'} /></div>
                }

            </div>
        </>
    )
}


export default withAdminPage(ProductsServicesPage)