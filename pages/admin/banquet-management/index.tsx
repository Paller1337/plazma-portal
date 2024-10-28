import AdminWrapper from '@/components/admin/AdminWrapper'
import HelpDesk from '@/components/admin/HelpOrder'
import ServiceOrder from '@/components/admin/ServiceOrder'
import { Divider, Grid, Group, Input, Loader, LoadingOverlay, rem, Stack, Table } from '@mantine/core'
import { IconCubeSend, IconDotsVertical, IconFileSpreadsheet, IconListDetails, IconSearch, IconTrash } from '@tabler/icons-react'
import { useAdminOrders } from 'context/admin/OrderContext'
import { getRooms } from 'helpers/bnovo/getRooms'
import { withAdminAuthServerSideProps } from 'helpers/withAdminAuthServerSideProps'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next/types'
import { useEffect, useState } from 'react'
import { TOrderStatus } from 'types/order'
import { ISupportTicket, TSupportTicketStatus } from 'types/support'

import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import 'mantine-react-table/styles.css'
import { useMemo } from 'react';
import {
    MantineReactTable,
    useMantineReactTable,
    type MRT_ColumnDef,
    MRT_GlobalFilterTextInput,
    MRT_ToggleFiltersButton,
} from 'mantine-react-table'
import { Box, Button, Flex, Menu, Text, Title } from '@mantine/core'
import { IconUserCircle, IconSend } from '@tabler/icons-react'
import ClientProviderLayout from '@/components/ClientProviderLayout'
import { fetchCommandStatus, fetchNomenclature, fetchOrganizations, fetchReserveOrganizations, fetchReserveRestaurantSections, fetchReserveStatusById, fetchReserveTerminalGroups, fetchRestaurantSectionsWorkload } from 'helpers/iiko/iikoClientApi'
import { getBanquetsError, getBanquetsNow } from 'helpers/banquets/db'
import { IReserveByPortal } from 'types/admin/banquets'
import { getBanquetInWork } from 'helpers/iiko/getBanquetsInWork'
import { NomenclatureResponse, Reserve, ReserveCreateRequest, ReserveStatusByIdResponse } from 'helpers/iiko/IikoApi/types'
import { ExcelDownloadProps } from '@/components/PlazmaBanquet/ExcelDownloadButton'
import ExcelDownloadButton from '@/components/PlazmaBanquet/ExcelDownloadButton'
import DeleteButton from '@/components/PlazmaBanquet/DeleteButton'
import { withAdminPage } from 'helpers/withAdminPage'
import { deleteCachedKeysByPattern } from 'helpers/redis'
import { useDisclosure } from '@mantine/hooks'
import toast from 'react-hot-toast'
import { axiosInstance } from 'helpers/axiosInstance'

interface BanquetManagementPageProps {
    banquetsPortal: IReserveByPortal[]
    banquetsDrafts?: IReserveByPortal[]
    banquetsError?: IReserveByPortal[]
    banquetsInWork: Reserve[]
    nomenclature: NomenclatureResponse
}

interface IActionMenu {
    data: Reserve | IReserveByPortal
    type: 'portal' | 'iiko'
}

export const getServerSideProps: GetServerSideProps = withAdminAuthServerSideProps(async (context) => {
    try {
        const banquetsPortal = await getBanquetsNow()
        const banquetsError = await getBanquetsError()
        console.log({ banquetsError })
        // const banquetsDrafts = await getBanquetsDrafts()

        const banquetsInWork = await getBanquetInWork()
        const reserves = banquetsInWork.reserves
        // console.log('GSSP banquetsInWork: ', reserves)

        const organizations = await fetchOrganizations()
        const nomenclature = await fetchNomenclature({ organizationId: organizations.organizations[0].id })
        return {
            props: {
                banquetsPortal: banquetsPortal,
                banquetsError: banquetsError,
                // banquetsDrafts: banquetsDrafts,
                banquetsInWork: reserves,
                nomenclature: nomenclature
            }
        };
    } catch (error) {
        console.error('Ошибка:', error);
        return {
            props: {
                banquetPortal: [],
                // banquetIiko: [],
            }
        };
    }
}, ['admin', 'banquet'])


function BanquetManagementPage(props: BanquetManagementPageProps) {
    // const [banquetsDraft, setBanquetsDraft] = useState<IReserveByPortal[]>([])
    const [banquetsPortal, setBanquetsPortal] = useState<IReserveByPortal[]>([])
    const [banquetsError, setBanquetsError] = useState<IReserveByPortal[]>([])
    const [banquetsInWork, setBanquetsInWork] = useState<Reserve[]>([])

    const [isOverlayL, overlayL] = useDisclosure(false)
    const [currentNav, setCurrentNav] = useState<TSupportTicketStatus>('new')
    const router = useRouter()
    const { state } = useAdminOrders()

    const query = router.query
    const nowDate = DateTime.now()

    const [org, setOrg] = useState('')
    const [corId, setCorId] = useState('')

    const onDeletedBanquet = (id: string, type: 'iiko' | 'portal') => {
        if (type === 'portal') setBanquetsPortal(banquetsPortal.filter(banquet => banquet.id !== id))
        else setBanquetsInWork(banquetsInWork.filter(banquet => banquet.id !== id))
    }

    const ActionsMenu = ({ data, type }: IActionMenu) => {
        return (
            <Menu shadow="md" width={200}>
                <Menu.Target>
                    <Button variant="transparent" size="md" color='#262E4A' >
                        <IconDotsVertical style={{ width: rem(20), height: rem(20) }} />
                    </Button>
                </Menu.Target>

                <Menu.Dropdown>
                    <Menu.Label>Управление банкетом</Menu.Label>
                    {type === 'portal'
                        ?
                        <Menu.Item leftSection={<IconListDetails color='#055' style={{ width: rem(18), height: rem(18) }} />}
                            onClick={() => {
                                overlayL.open()
                                router.push(`/admin/banquet-management/${(data as IReserveByPortal).id}`, null, { shallow: true })
                                    .finally(() => overlayL.close())
                            }}
                        >
                            Открыть
                        </Menu.Item>
                        : <></>
                    }
                    {type === 'iiko'
                        ? <ExcelDownloadButton nomenclature={props.nomenclature} dataReserve={data as Reserve} />
                        : <ExcelDownloadButton nomenclature={props.nomenclature} dataBanquet={data as IReserveByPortal} />
                    }
                    {/* {type === 'portal'
                        ? <Menu.Item leftSection={<IconCubeSend color='#f23' style={{ width: rem(18), height: rem(18) }} />}>
                            Передать в IIKO
                        </Menu.Item>
                        : <></>
                    } */}

                    <Menu.Divider />
                    {type === 'iiko'
                        ? <>
                            {/* <DeleteButton data={data} type='iiko' /> */}
                        </>
                        : <DeleteButton data={data} type='portal' onStatusChanged={() => onDeletedBanquet(data.id, type)} />
                    }
                </Menu.Dropdown>
            </Menu>
        )
    }

    const rowsDraft = []

    const rowsError = banquetsError ? banquetsError?.map((banquet, index) => (
        <Table.Tr key={index} h={80} style={{ border: '1px solid #E5E5E5', borderRadius: 24, background: '#ffb1b1' }}>
            <Table.Td miw={190}>{DateTime.fromSQL(banquet?.banquetData.estimatedStartTime).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}</Table.Td>
            <Table.Td miw={110}>{DateTime.fromSQL(banquet?.banquetData.estimatedStartTime).toLocaleString(DateTime.TIME_24_SIMPLE)}</Table.Td>
            <Table.Td>{banquet?.banquetData.guests.count}</Table.Td>
            <Table.Td miw={160}>{banquet?.banquetData.customer.name}</Table.Td>
            <Table.Td miw={130}>{banquet?.banquetData.phone}</Table.Td>
            <Table.Td>{banquet?.banquetData.comment}</Table.Td>
            <Table.Td>{Math.floor(banquet.banquetData.durationInMinutes / 60)} ч. {banquet.banquetData.durationInMinutes % 60} мин.</Table.Td>
            <Table.Td>{banquet.idN || banquet.id}</Table.Td>
            <Table.Td>
                {
                    (banquet.banquetData.order?.items || []).reduce(
                        (acc, { price, amount }) => acc + (Number(price) * Number(amount)), 0
                    ).toFixed(2)
                }
            </Table.Td>
            <Table.Td>{banquet.payments?.reduce((result, { sum }) => result + (sum as number), 0) || 0}</Table.Td>
            <Table.Td>
                <ActionsMenu data={banquet} type='portal' />
            </Table.Td>
        </Table.Tr>
    )) : []

    const rowsPortal = banquetsPortal?.map((banquet, index) => (
        <Table.Tr key={index} h={80}>
            <Table.Td miw={190}>{DateTime.fromSQL(banquet?.banquetData.estimatedStartTime).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}</Table.Td>
            <Table.Td miw={110}>{DateTime.fromSQL(banquet?.banquetData.estimatedStartTime).toLocaleString(DateTime.TIME_24_SIMPLE)}</Table.Td>
            <Table.Td>{banquet?.banquetData.guests.count}</Table.Td>
            <Table.Td miw={160}>{banquet?.banquetData.customer.name}</Table.Td>
            <Table.Td miw={130}>{banquet?.banquetData.phone}</Table.Td>
            <Table.Td>{banquet?.banquetData.comment}</Table.Td>
            <Table.Td>{Math.floor(banquet.banquetData.durationInMinutes / 60)} ч. {banquet.banquetData.durationInMinutes % 60} мин.</Table.Td>
            <Table.Td>{banquet.idN || banquet.id}</Table.Td>
            <Table.Td>
                {
                    (banquet.banquetData.order?.items || []).reduce(
                        (acc, { price, amount }) => acc + (Number(price) * Number(amount)), 0
                    ).toFixed(2)
                }
            </Table.Td>
            <Table.Td>{banquet.payments?.reduce((result, { sum }) => result + (sum as number), 0) || 0}</Table.Td>
            <Table.Td>
                <ActionsMenu data={banquet} type='portal' />
            </Table.Td>
        </Table.Tr>
    ))

    const rowsIiko = banquetsInWork?.map((banquet, index) => (
        <Table.Tr key={index} h={80} bg={'rgb(0 149 18 / 8%)'}>
            <Table.Td miw={190}>{DateTime.fromSQL(banquet?.reserve.estimatedStartTime).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)}</Table.Td>
            <Table.Td miw={110}>{DateTime.fromSQL(banquet?.reserve.estimatedStartTime).toLocaleString(DateTime.TIME_24_SIMPLE)}</Table.Td>
            <Table.Td>{banquet?.reserve.guestsCount}</Table.Td>
            <Table.Td miw={160}>{banquet?.reserve.customer.name}</Table.Td>
            <Table.Td miw={130}>{banquet?.reserve.phone}</Table.Td>
            <Table.Td>{banquet?.reserve.comment}</Table.Td>
            <Table.Td>{Math.floor(banquet.reserve.durationInMinutes / 60)} ч. {banquet.reserve.durationInMinutes % 60} мин.</Table.Td>
            <Table.Td>{banquet?.reserve.order.number}</Table.Td>
            <Table.Td>
                {/* {
                    (banquet.reserve.order?.items || []).reduce(
                        (acc, { price, amount }) => acc + (Number(price) * Number(amount)), 0
                    ).toFixed(2)
                } */}
                -
            </Table.Td>
            <Table.Td>
                {/* {banquet.reserve.p?.reduce((result, { sum }) => result + (sum as number), 0) || 0} */}
                -
            </Table.Td>
            <Table.Td>
                <ActionsMenu data={banquet} type='iiko' />
            </Table.Td>
        </Table.Tr>
    ))

    const clearCache = async () => {
        overlayL.open()
        await deleteCachedKeysByPattern('iiko:*')
            .then(r => console.log('clearCache: ', r))
            .finally(() => {
                overlayL.close()
                toast.success('Кэш очищен')
            })
    }
    // const fetch = async () => {
    //     const reserveOrganizations = await fetchReserveOrganizations()
    //     console.log('fetchReserveOrganizations', reserveOrganizations)


    //     const reserveTerminalGroups = await fetchReserveTerminalGroups({ organizationIds: [reserveOrganizations?.organizations[0].id] })
    //     console.log('fetchReserveTerminalGroups', reserveTerminalGroups)

    //     const reserveRestaurantSections = await fetchReserveRestaurantSections({ terminalGroupIds: [reserveTerminalGroups?.terminalGroups[0].items[1].id] })
    //     console.log('fetchReserveRestaurantSections', reserveRestaurantSections)

    //     const restaurantSectionIds = reserveRestaurantSections.restaurantSections.map((item) => item.id)
    //     const restaurantSectionsWorkload = await fetchRestaurantSectionsWorkload({ restaurantSectionIds: restaurantSectionIds, dateFrom: '2019-08-24 14:15:22.123' })
    //     console.log('fetchRestaurantSectionsWorkload', restaurantSectionsWorkload)

    //     const reserveIds = restaurantSectionsWorkload.reserves.map((item) => item.id)
    //     console.log('reserveIds', reserveIds)
    //     const reserveStatusById = await fetchReserveStatusById({ organizationId: reserveOrganizations.organizations[0].id, reserveIds: reserveIds })
    //     console.log('fetchReserveStatusById', reserveStatusById)
    // }

    // const check = async () => {
    //     const commandStatus = await fetchCommandStatus({
    //         correlationId: 'b1ca99a0-be17-4701-a6b3-3dd45e1a955e', organizationId: "55535df8-0c9c-4976-a82f-6d3150afaf03"
    //     })
    //     console.log('commandStatus', commandStatus)
    // }

    useEffect(() => setBanquetsPortal(props.banquetsPortal), [props.banquetsPortal])
    useEffect(() => setBanquetsError(props.banquetsError), [props.banquetsError])
    useEffect(() => setBanquetsInWork(props.banquetsInWork), [props.banquetsInWork])


    useEffect(() => {
        //init banquets
        setBanquetsInWork(props.banquetsInWork)
        setBanquetsPortal(props.banquetsPortal)
    }, [props.banquetsInWork, props.banquetsPortal])

    useEffect(() => {
        let int
        int = setInterval(async () => {

            console.log('Обновляем банкеты в работе!')
            const data = await axiosInstance.post('/api/iiko/utils/banquets-in-work')
            console.log({ b: data.data.banquets })
            setBanquetsInWork(data.data.banquets.reserves)
        }, 60000)
        return () => clearInterval(int)
    }, [])
    useEffect(() => {
        console.log('BANQUETS FROM DB: ', props.banquetsPortal[0])
        console.log('BANQUETS FROM IIKO: ', props.banquetsInWork[0])
    }, [props])

    return (
        <>
            <LoadingOverlay visible={isOverlayL} />
            <ClientProviderLayout>
                <div className='admin--order'>
                    <div className='admin--order__header'>
                        <div className='admin--order__header-content'>
                            <span className='admin--order__header-title'>Управление банкетами</span>
                            <div className='admin--order__header-filters'>
                                <Group px={24}>
                                    <Button variant="filled" color='blue' radius={'md'} size="sm" py={2}>Банкеты в работе</Button>
                                    <Button variant="transparent" color='blue' radius={'md'} size="sm" py={2}
                                        onClick={() => {
                                            overlayL.open()
                                            router.push('/admin/banquet-management/history', undefined, { shallow: true })
                                        }}>
                                        История
                                    </Button>
                                    {/* <Button variant="filled" color='green' radius={'md'} size="sm" py={2} onClick={fetch}>fetch</Button> */}
                                    {/* <Button variant="filled" color='teal' radius={'md'} size="sm" py={2} onClick={check}>check</Button> */}
                                </Group>
                                <Input
                                    placeholder="Поиск..."
                                    rightSection={<IconSearch size={16} />}
                                    radius={'md'}
                                    size='md'
                                    disabled
                                />
                            </div>
                        </div>
                        <div className='admin-main__vs' />
                    </div>

                    <Group px={24} py={12} gap={8}>
                        <Button
                            variant="filled"
                            color='blue'
                            radius={'md'}
                            size="md"
                            w={'fit-content'}
                            fw={500}
                            onClick={() => {
                                overlayL.open()
                                router.push('/admin/banquet-management/create', null, { shallow: true })
                            }}
                        >
                            Новый банкет
                        </Button>
                        {/* <Button variant="filled" color='red' radius={'md'} size="md" w={'fit-content'} fw={500} ml={'auto'}
                            onClick={clearCache} >Очистить кэш</Button> */}
                    </Group>
                    {/* 
                <Divider my={'md'}/> */}


                    <Stack px={24} py={12}>
                        {rowsError.length > 0 ? <>
                            <Text mx={'auto'} fw={700} fz={20} mt={48}>Ошибки</Text>
                            <Divider my={'sm'} />
                            <Table>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Дата</Table.Th>
                                        <Table.Th>Время</Table.Th>
                                        <Table.Th>Кол-во гостей</Table.Th>
                                        <Table.Th>Имя гостя</Table.Th>
                                        <Table.Th>Телефон</Table.Th>
                                        <Table.Th>Комментарий</Table.Th>
                                        <Table.Th>Длительность</Table.Th>
                                        <Table.Th>Номер заказа</Table.Th>
                                        <Table.Th>Сумма</Table.Th>
                                        <Table.Th>Внесено</Table.Th>
                                        <Table.Th></Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>{rowsError}</Table.Tbody>
                            </Table>
                        </>
                            : <></>}



                        {rowsDraft.length > 0 ? <>
                            <Text mx={'auto'} fw={700} fz={20} mt={48}>Черновики</Text>
                            <Divider my={'sm'} />
                            <Table>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Дата</Table.Th>
                                        <Table.Th>Время</Table.Th>
                                        <Table.Th>Кол-во гостей</Table.Th>
                                        <Table.Th>Имя гостя</Table.Th>
                                        <Table.Th>Телефон</Table.Th>
                                        <Table.Th>Комментарий</Table.Th>
                                        <Table.Th>Длительность</Table.Th>
                                        <Table.Th>Номер заказа</Table.Th>
                                        <Table.Th>Сумма</Table.Th>
                                        <Table.Th>Внесено</Table.Th>
                                        <Table.Th></Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>{rowsDraft}</Table.Tbody>
                            </Table>
                        </>
                            : <></>}

                        <Text mx={'auto'} fw={700} fz={20} mt={48}>В работе</Text>
                        <Divider my={'sm'} />
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Дата</Table.Th>
                                    <Table.Th>Время</Table.Th>
                                    <Table.Th>Кол-во гостей</Table.Th>
                                    <Table.Th>Имя гостя</Table.Th>
                                    <Table.Th>Телефон</Table.Th>
                                    <Table.Th>Комментарий</Table.Th>
                                    <Table.Th>Длительность</Table.Th>
                                    <Table.Th>Номер заказа</Table.Th>
                                    <Table.Th>Сумма</Table.Th>
                                    <Table.Th>Внесено</Table.Th>
                                    <Table.Th></Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>{rowsPortal}</Table.Tbody>
                        </Table>


                        <Text mx={'auto'} fw={700} fz={20} mt={48}>Переданы в IIKO</Text>
                        <Divider my={'sm'} />
                        {rowsIiko.length > 0 ?
                            <Table>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Дата</Table.Th>
                                        <Table.Th>Время</Table.Th>
                                        <Table.Th>Кол-во гостей</Table.Th>
                                        <Table.Th>Имя гостя</Table.Th>
                                        <Table.Th>Телефон</Table.Th>
                                        <Table.Th>Комментарий</Table.Th>
                                        <Table.Th>Длительность</Table.Th>
                                        <Table.Th>Номер заказа</Table.Th>
                                        <Table.Th>Сумма</Table.Th>
                                        <Table.Th>Внесено</Table.Th>
                                        <Table.Th></Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>{rowsIiko}</Table.Tbody>
                            </Table>
                            :
                            <Stack justify='center' align='center' w={'100%'} h={120} mb={120}>
                                <Text fw={600}>Банкетов в IIKO нет</Text>
                            </Stack>
                        }
                    </Stack>
                </div>
            </ClientProviderLayout>
        </>
    )
}

export default withAdminPage(BanquetManagementPage)