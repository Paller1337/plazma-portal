import AdminWrapper from '@/components/admin/AdminWrapper'
import ServiceOrder from '@/components/admin/ServiceOrder'
import { Code, Group, Input, Loader, Paper, SegmentedControl, Stack, Text } from '@mantine/core'
import { useAdminOrders } from 'context/admin/OrderContext'
import { getRooms } from 'helpers/bnovo/getRooms'
import { withAdminAuthServerSideProps } from 'helpers/withAdminAuthServerSideProps'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next/types'
import { useEffect, useState } from 'react'
import { IOrder, TOrderStatus } from 'types/order'
import { IconSearch } from '@tabler/icons-react'
import { DateTime } from 'luxon'
import { withAdminPage } from 'helpers/withAdminPage'
import { useIiko } from 'context/IikoContext'
import { ReactSVG } from 'react-svg'
import useSound from 'use-sound'
import { useInterval, useMediaQuery } from '@mantine/hooks'
import ReactJson from 'react18-json-view';
import { notify } from 'utils/notify'
import { FaCoffee } from 'react-icons/fa'
import { FaFirstOrder } from 'react-icons/fa6'




interface AdminOrdersPageProps {
    rooms?: any
}


export const getServerSideProps: GetServerSideProps = withAdminAuthServerSideProps(async (context) => {
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
}, ['admin', 'moderator'])

interface PageNavItemProps {
    isActive?: boolean
    name: string
    count: number
    onClick?: () => void
}

type TNavItem = {
    status?: TOrderStatus,
    name: string,
    count: number
}


const groupOrdersByDate = (orders: IOrder[]) => {
    return orders.reduce((groups, order) => {
        const date = DateTime.fromISO(order.create_at).toFormat('yyyy-MM-dd')
        if (!groups[date]) {
            groups[date] = []
        }
        groups[date].push(order)
        return groups
    }, {})
}

function OrdersPage(props: AdminOrdersPageProps) {
    const [play, { stop }] = useSound('/mp3/ringing-2.mp3'); // 1 sec
    const [currentNav, setCurrentNav] = useState<TOrderStatus>('new')
    const hotelRooms = props.rooms?.filter(x => x.tags !== '')
    const { state, productsList, socketRef, ordersIsLoading } = useAdminOrders()
    const [isSfxPlaying, setIsSfxPlaying] = useState(false)

    const eatOrders = state.orders.filter(x => x.store.store_type.value === 'eat')

    const [orders, setOrders] = useState(eatOrders)
    const [orderFetchTime, setOrderFetchTime] = useState(null)
    const { getNomenclature, organizations, nomenclature } = useIiko()

    const playInterval = useInterval(() => play(), 2000)

    const isTablet = useMediaQuery('(max-width: 1024px)')

    const [eatData, setEatData] = useState(null)

    const [currentLength, setCurrentLength] = useState(eatOrders.length)
    const [socketStatus, setSocketStatus] = useState<'disconnected' | 'connected'>('disconnected')

    const router = useRouter()
    const query = router.query

    const groupedOrders = groupOrdersByDate(orders)


    const navItems: TNavItem[] = [
        // { status: 'null', name: 'Все', count: eatOrders.length },
        { status: 'new', name: 'Новые', count: eatOrders.filter(x => x.status === 'new').length },
        { status: 'inwork', name: 'На кухне', count: eatOrders.filter(x => x.status === 'inwork').length },
        { status: 'delivered', name: 'В доставке', count: eatOrders.filter(x => x.status === 'delivered').length },
        { status: 'done', name: 'Готовы', count: eatOrders.filter(x => x.status === 'done').length },
        { status: 'canceled', name: 'Отменены', count: eatOrders.filter(x => x.status === 'canceled').length },
    ]

    useEffect(() => {
        if (socketRef.current?.connected) {
            const socket = socketRef.current;

            const handleEatOrderCreate = (data) => {
                console.log('new eatOrderCreate');
                notify({
                    title: 'Новый заказ',
                    message: 'Необходимо принять заказ',
                    icon: <FaFirstOrder />,
                });
                if (!isSfxPlaying) {
                    playInterval.start();
                    setIsSfxPlaying(true);
                }
            };

            // Удаляем старую подписку перед добавлением новой
            socket.off('eatOrderCreate', handleEatOrderCreate);
            socket.on('eatOrderCreate', handleEatOrderCreate);

            // Чистим обработчик при размонтировании
            return () => {
                socket.off('eatOrderCreate', handleEatOrderCreate);
            };
        }
    }, [playInterval, socketRef.current, isSfxPlaying]);


    const stopSfx = () => {
        setIsSfxPlaying(false)
        playInterval.stop()
        stop()
    }

    const loadOrders = (status?: TOrderStatus) => {
        let tmporders
        switch (status) {
            case 'done':
                tmporders = eatOrders.filter(x => x.status === 'done')
                setOrders(tmporders)
                break

            case 'delivered':
                tmporders = eatOrders.filter(x => x.status === 'delivered')
                setOrders(tmporders)
                break;

            case 'inwork':
                tmporders = eatOrders.filter(x => x.status === 'inwork')
                setOrders(tmporders)
                break;

            case 'canceled':
                tmporders = eatOrders.filter(x => x.status === 'canceled')
                setOrders(tmporders)
                break;

            case 'new':
                tmporders = eatOrders.filter(x => x.status === 'new')
                setOrders(tmporders)
                break

            case 'null':
                tmporders = eatOrders
                setOrders(tmporders)
                break

            default:
                tmporders = eatOrders
                setOrders(tmporders)
                break
        }
    }

    useEffect(() => {
        if (organizations && organizations.length > 0) {
            if (!nomenclature) {
                console.log('GET NOMEN')
                getNomenclature(organizations[0].id)
            }
        }
    }, [organizations])

    useEffect(() => {
        if (!router.query.status) {
            router.push(`/admin/portal/rest?status=new`, undefined, { shallow: true })
        }
    }, [router])

    const changeTab = (newStatus: TOrderStatus) => {
        setCurrentNav(newStatus)
        router.push(`/admin/portal/rest?status=${newStatus}`, undefined, { shallow: true });
    }

    useEffect(() => {
        console.log('state.orders trigger')
        setOrders(() => eatOrders)
        loadOrders((query.status as string) as TOrderStatus)
    }, [state.orders, query.status])

    // useEffect(() => {
    //     if (currentLength !== eatOrders.length) {
    //         setCurrentLength(eatOrders.length)
    //     }
    // }, [eatOrders.length])

    const nowDate = DateTime.now()

    return (
        <>
            {/* <Text
                c={socketRef.current.connected ? 'green' : 'red'}
                pos={'absolute'} left={32} top={0}
                style={{ zIndex: 10000, color: 'white', fontSize: 10 }}
            >
                {socketRef.current.connected ? 'connected' : 'disconnected'}
            </Text> */}
            <Paper
                bg={socketRef.current?.connected ? 'green' : 'red'}
                radius={'xl'} w={12} h={12}
                pos={'absolute'} right={isTablet ? 0 : 24} top={0}
                style={{ zIndex: 10000, color: 'white', fontSize: 10 }}
            />
            <Stack
                pos={'absolute'} left={0} top={0}
                style={{ zIndex: 10000, color: 'white', fontSize: 10 }}
            >
                {isSfxPlaying ? 'SFX Playing' : 'SFX Stopped'}
            </Stack>
            <div className='admin--order'>
                <Group bg={'#262E4A'} w={'100%'} px={24} py={24} justify='space-between' style={{ borderRadius: '0 0 32px 32px ' }}>
                    <div className='admin-nav__header-content'>
                        <ReactSVG className='admin-nav__header-logo' src='/svg/logo-white-48.svg' />
                        <span className='admin-nav__header-hs' />
                        <div className='admin-nav__header-info'>
                            <span className='admin-nav__header-title'>Мониторинг заказов</span>
                            <span className='admin-nav__header-partition'>
                                Общепит
                            </span>
                        </div>
                    </div>
                    <SegmentedControl
                        color="#262E4A"
                        data={navItems.map(x => ({ value: x.status, label: `${x.name} ${x.count}` }))}
                        radius={'xl'}
                        size='md'
                        onChange={changeTab}
                    />
                </Group>
                {orders.length > 0 ?
                    <div className='admin--order__opd-wrapper'>
                        {Object.keys(groupedOrders).map((date, i) => (
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
                                <div className='admin-serviceCards'>
                                    {groupedOrders[date].map((order: IOrder) => (
                                        <ServiceOrder
                                            onClick={stopSfx}
                                            key={'order-in-list-' + order.id}
                                            order={order}
                                            products={productsList}
                                            isVisualNew={order.isVisualNew}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    :
                    <div className='admin--order__loader'>
                        {ordersIsLoading ? <Loader size={48} color={'#485066'} /> : orders.length < 1 ? <Text>Нет заказов</Text> : <></>}
                    </div>
                }
                {/* <Stack align="center" justify="center">
                    {eatData ? (
                        <ReactJson
                            src={eatData}
                            enableClipboard={false}
                            // displayDataTypes
                        />
                    ) : null}
                </Stack> */}
            </div>
        </>
    )
}

export default withAdminPage(OrdersPage)