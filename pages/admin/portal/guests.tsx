import AdminWrapper from '@/components/admin/AdminWrapper'
import ServiceOrder from '@/components/admin/ServiceOrder'
import { Input, Loader, LoadingOverlay, SegmentedControl, Switch, Table } from '@mantine/core'
import { useAdminOrders } from 'context/admin/OrderContext'
import { getRooms } from 'helpers/bnovo/getRooms'
import { withAdminAuthServerSideProps } from 'helpers/withAdminAuthServerSideProps'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next/types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { TOrderStatus } from 'types/order'
import { IconSearch } from '@tabler/icons-react'
import { DateTime } from 'luxon'
import { axiosInstance } from 'helpers/axiosInstance'
import { IGuestAccount } from 'types/session'
import toast from 'react-hot-toast'
import { withAdminPage } from 'helpers/withAdminPage'


interface AdminOrdersPageProps {
    guests?: IGuestAccount[]
}

export const getServerSideProps: GetServerSideProps = withAdminAuthServerSideProps(async (context) => {
    try {
        const guests = await axiosInstance.post('/api/admin/guest/fetch')

        console.log('guests gssp ', guests.data.guests.data)
        if (!guests.data) {
            throw new Error(`Комнат нет`)
        }

        const result = guests.data.guests.data.map(guest => ({
            id: guest.id,
            mailing: guest.attributes.email,
            role: guest.attributes.role,
            name: guest.attributes.name,
            approved: guest.attributes.approved,
            email: guest.attributes.email,
            phone: guest.attributes.phone,
            createdAt: guest.attributes.createdAt,
        }) as IGuestAccount
        ) as IGuestAccount[]

        return {
            props: {
                guests: result,
            }
        }

    } catch (error) {
        console.error('Ошибка:', error);
        return {
            props: {
                guests: []
            }
        };
    }
}, ['admin', 'moderator'])

type TGuestStatusApproved = 'approved' | 'not-approved' | 'null'

type TNavItem = {
    approved?: TGuestStatusApproved,
    name: string,
    count: number
}


function GuestsPage(props: AdminOrdersPageProps) {
    const [currentNav, setCurrentNav] = useState<TGuestStatusApproved>('null')
    const [initGuests, setInitGuests] = useState<IGuestAccount[]>(props.guests)
    const [guests, setGuests] = useState<IGuestAccount[]>(props.guests)
    const [searchFilter, setSearchFilter] = useState('')
    const [visibleLoadingOverlay, setVisibleLoadingOverlay] = useState(false)

    const router = useRouter()
    const query = router.query

    const navItems: TNavItem[] = [
        { approved: 'null', name: 'Все', count: initGuests.length },
        { approved: 'not-approved', name: 'Заблокированные', count: initGuests.filter(x => x.approved === false).length },
        { approved: 'approved', name: 'Не заблокированные', count: initGuests.filter(x => x.approved === true).length },
    ]


    const GuestRow = (guest: IGuestAccount) => {
        const [isApproved, setIsApproved] = useState(guest.approved)

        // useEffect(() => {
        //     updateStatus(guest.id, isApproved)
        // }, [isApproved, guest.id])

        async function updateStatus(id: number, approved: boolean) {
            setVisibleLoadingOverlay(true)
            try {
                const response = await axiosInstance.put('/api/guest/update',
                    {
                        data: { id, approved }
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })

                if (response.status !== 200) {
                    toast.error('Ошибка при обновлении статуса заказа')
                    setVisibleLoadingOverlay(false)
                    throw new Error('Ошибка при обновлении статуса заказа')
                }
                console.log('new status ', response.data.newData.data.attributes.approved)
                // setIsApproved(response.data.approved)
                setInitGuests(guests => guests.map(x => x.id === id ? { ...x, approved: response.data.newData.data.attributes.approved } : x))
                toast.success('Статус обновлен')
                setVisibleLoadingOverlay(false)
                return
            } catch (error) {
                console.error('Ошибка:', error);
                throw error;
            }
        }

        return (
            <Table.Tr>
                <Table.Td>{guest.name}</Table.Td>
                <Table.Td>{guest.phone}</Table.Td>
                <Table.Td>
                    <Switch
                        checked={isApproved}
                        onChange={(event) => updateStatus(guest.id, event.currentTarget.checked)}
                    />
                </Table.Td>
                <Table.Td>{DateTime.fromISO(guest.createdAt).toLocaleString(DateTime.DATETIME_MED)}</Table.Td>
                <Table.Td>{guest.id}</Table.Td>
            </Table.Tr>
        )
    }

    const rows =
        // (searchFilter ? guests.filter(x =>
        //     x.name.toLocaleLowerCase().includes(searchFilter.toLowerCase()) ||
        //     x.phone.toLocaleLowerCase().includes(searchFilter.toLowerCase()) ||
        //     x.email.toLocaleLowerCase().includes(searchFilter.toLowerCase())
        // ) : guests)
        guests.map((guest) => (
            <GuestRow key={'guest-id-' + guest.id} {...guest} />
        ))

    const loadGuests = useCallback((approved?: TGuestStatusApproved) => {
        let tmporders
        switch (approved) {
            case 'approved':
                tmporders = initGuests.filter(x => x.approved === true)
                // setGuests(tmporders)
                console.log('approved: ', tmporders)
                break

            case 'not-approved':
                tmporders = initGuests.filter(x => x.approved === false)
                // setGuests(tmporders)
                console.log('not-approved: ', tmporders)
                break;

            case 'null':
                tmporders = initGuests
                // setGuests(tmporders)
                console.log('null: ', tmporders)
                break

            default:
                tmporders = initGuests
                // setGuests(tmporders)
                console.log('default: ', tmporders)
                break
        }

        const result = (searchFilter ? tmporders.filter(x =>
            x.name.toLocaleLowerCase().includes(searchFilter.toLowerCase()) ||
            x.phone.toLocaleLowerCase().includes(searchFilter.toLowerCase()) ||
            x.email.toLocaleLowerCase().includes(searchFilter.toLowerCase())
        ) : tmporders)

        console.log('before filter: ', result)
        setGuests(result)
    }, [initGuests, searchFilter])

    const changeTab = (newApproved: TGuestStatusApproved) => {
        setCurrentNav(newApproved)
        router.push(`/admin/portal/guests?approved=${newApproved}`, undefined, { shallow: true });
    }

    useEffect(() => { setInitGuests(props.guests); setGuests(props.guests) }, [props.guests])
    useEffect(() => {
        loadGuests((query.approved as string) as TGuestStatusApproved)
    }, [query.approved, loadGuests])

    useEffect(() => setCurrentNav(query.approved as TGuestStatusApproved), [])
    useEffect(() => {
        console.log('searchFilter: ', searchFilter)
        console.log('guests: ', guests)
    }, [guests, searchFilter])

    // useEffect(() => {
    //     console.log('guests: ', props.guests)
    // }, [props])
    const nowDate = DateTime.now()

    return (
        <>
            <LoadingOverlay
                visible={visibleLoadingOverlay}
                zIndex={1000}
                overlayProps={{ radius: 'md', blur: 2 }}
                loaderProps={{ color: 'gray', type: 'oval' }}
            />
            <div className='admin--guests'>
                <div className='admin--guests__header'>
                    <div className='admin--guests__header-content'>
                        <span className='admin--guests__header-title'>Гости</span>
                        <div className='admin--guests__header-filters'>
                            <SegmentedControl
                                color="#262E4A"
                                data={navItems.map(x => ({ value: x.approved, label: `${x.name} ${x.count}` }))}
                                radius={'md'}
                                size='md'
                                onChange={changeTab}
                            />
                            <Input
                                placeholder="Поиск..."
                                rightSection={<IconSearch size={16} />}
                                radius={'md'}
                                size='md'
                                value={searchFilter}
                                onChange={(event) => setSearchFilter(event.currentTarget.value)}
                            />
                        </div>
                    </div>
                    <div className='admin-main__vs' />
                </div>


                {props.guests.length > 0 ?
                    <div className='admin--guests__table'>
                        <Table stickyHeader stickyHeaderOffset={60}>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Имя</Table.Th>
                                    <Table.Th>Телефон</Table.Th>
                                    <Table.Th>Доступ разрешен</Table.Th>
                                    <Table.Th>Дата регистрации</Table.Th>
                                    <Table.Th>ID</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            {guests.length > 0 ? <Table.Tbody>{rows}</Table.Tbody> : <Table.Caption>Нет гостей</Table.Caption>}
                        </Table>
                    </div>
                    :
                    <div className='admin--guests__loader'><Loader size={48} color={'#485066'} /></div>
                }
            </div>
        </>
    )
}

export default withAdminPage(GuestsPage)