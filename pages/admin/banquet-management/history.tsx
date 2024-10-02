/// <reference path="../../../types/declarations/mantine-react-table.d.ts" />

import { ActionIcon, Divider, Group, Input, LoadingOverlay, rem, ScrollArea, Stack, Table, Tooltip } from '@mantine/core'
import { IconCubeSend, IconDotsVertical, IconSearch, IconTrash } from '@tabler/icons-react'
import { withAdminAuthServerSideProps } from 'helpers/withAdminAuthServerSideProps'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next/types'
import { useEffect, useRef, useState } from 'react'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import 'mantine-react-table/styles.css'

import { Button, Menu, Text } from '@mantine/core'
import ClientProviderLayout from '@/components/ClientProviderLayout'
import { fetchNomenclature, fetchOrganizations } from 'helpers/iiko/iikoClientApi'
import { getBanquetsHistory, } from 'helpers/banquets/db'
import { IReserveByPortal } from 'types/admin/banquets'
import { NomenclatureResponse, Reserve } from 'helpers/iiko/IikoApi/types'
import { ExcelDownloadProps } from '@/components/PlazmaBanquet/ExcelDownloadButton'
import ExcelDownloadButton from '@/components/PlazmaBanquet/ExcelDownloadButton'
import DeleteButton from '@/components/PlazmaBanquet/DeleteButton'
import dynamic from 'next/dynamic'
import { useVirtualizer } from '@tanstack/react-virtual'
import { MRT_ColumnDef, MRT_Row, MRT_RowVirtualizer, MRT_SortingState, useMantineReactTable } from 'mantine-react-table'

import { MRT_Localization_RU } from 'mantine-react-table/locales/ru/index.cjs'
import { useDisclosure } from '@mantine/hooks'
import { withAdminPage } from 'helpers/withAdminPage'

interface BanquetManagementPageProps {
    banquetsHistory: IReserveByPortal[]
    nomenclature: NomenclatureResponse
}

interface IActionMenu {
    data: Reserve | IReserveByPortal
    type: 'portal' | 'iiko'
}

const MantineReactTable = dynamic(() => import('mantine-react-table').then((mod) => mod.MantineReactTable), { ssr: false })


export const getServerSideProps: GetServerSideProps = withAdminAuthServerSideProps(async (context) => {
    try {
        const banquetsHistory = await getBanquetsHistory()

        const organizations = await fetchOrganizations()
        const nomenclature = await fetchNomenclature({ organizationId: organizations.organizations[0].id })
        return {
            props: {
                banquetsHistory: banquetsHistory,
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


function BanquetHistoryPage(props: BanquetManagementPageProps) {
    const [banquetsHistory, setBanquetsHistory] = useState<IReserveByPortal[]>([])

    const [isOverlayL, overlayL] = useDisclosure(false)
    const [isLoading, setIsLoading] = useState(true)
    const [sorting, setSorting] = useState<MRT_SortingState>([])
    const [openedMenuModal, { open: openMenuModal, close: closeMenuModal }] = useDisclosure(false)

    const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null)

    const router = useRouter()

    const query = router.query
    const nowDate = DateTime.now()

    const onStatusChanged = (id: string, type: 'iiko' | 'portal', action: 'isDeleted' | 'status') => {
        console.log('onStatusChanged callback', { id, type, action })
        switch (action) {
            case 'isDeleted':
                setBanquetsHistory(banquetsHistory
                    .map(banquet => banquet.id === id
                        ? ({
                            ...banquet,
                            isDeleted: !banquet.isDeleted,
                        })
                        : banquet
                    ))
                break
            case 'status':
                setBanquetsHistory(banquetsHistory
                    .map(banquet => banquet.id === id
                        ? ({
                            ...banquet,
                            status: 'not_sent',
                        })
                        : banquet
                    ))

            default:
                setBanquetsHistory(p => p)
                break

        }

    }

    const ActionsMenu = ({ data, type }: IActionMenu) => {
        return (
            <Menu shadow="md" width={200}>
                <Menu.Target>
                    <Button variant="filled" size="md"
                        color={
                            (data as IReserveByPortal).isDeleted ? '#f23' : (data as IReserveByPortal).status === 'sent' ? 'green' : 'blue'
                        }
                        px={8} >
                        <IconDotsVertical color='#fff' width={20} style={{ width: rem(20), height: rem(20) }} />
                    </Button>
                </Menu.Target>

                <Menu.Dropdown>
                    <Menu.Label>Управление банкетом</Menu.Label>
                    {type === 'iiko'
                        ? <ExcelDownloadButton nomenclature={props.nomenclature} dataReserve={data as Reserve} />
                        : <ExcelDownloadButton nomenclature={props.nomenclature} dataBanquet={data as IReserveByPortal} />
                    }
                    {/* <Menu.Item leftSection={<IconCubeSend color='#f23' style={{ width: rem(18), height: rem(18) }} />}>
                        Передать в IIKO
                    </Menu.Item> */}

                    <Menu.Divider />
                    {type === 'iiko'
                        ? <DeleteButton data={data} type='iiko' />
                        : <DeleteButton data={data} type='portal' onStatusChanged={(e) => { onStatusChanged(data.id, type, e) }} />
                    }
                </Menu.Dropdown>
            </Menu >
        )
    }



    useEffect(() => {
        console.log('BANQUETS FROM DB: ', props.banquetsHistory)
    }, [props])

    const columns: MRT_ColumnDef<IReserveByPortal>[] = [
        {
            header: 'Дата',
            accessorFn: row => row?.banquetData?.estimatedStartTime
                ? DateTime.fromSQL(row.banquetData.estimatedStartTime).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY)
                : '-', size: 200,
            sortingFn: (rowA, rowB, datetime) => {
                const timeA = DateTime.fromSQL(rowA.original?.banquetData?.estimatedStartTime).toMillis();
                const timeB = DateTime.fromSQL(rowB.original?.banquetData?.estimatedStartTime).toMillis();
                if (datetime === 'asc') {
                    return timeA - timeB;
                } else {
                    return timeB - timeA;
                }
            },
        },
        { header: 'Время', accessorFn: row => DateTime.fromSQL(row?.banquetData?.estimatedStartTime).toLocaleString(DateTime.TIME_24_SIMPLE) || '-', size: 100 },
        { header: 'Кол-во гостей', accessorFn: row => row.banquetData?.guests?.count || '-', size: 120 },
        { header: 'Имя гостя', accessorFn: row => row.banquetData?.customer?.name || '-', size: 160 },
        { header: 'Телефон', accessorFn: row => row.banquetData?.phone || '-', size: 150 },
        { header: 'Комментарий', accessorFn: row => row.banquetData?.comment || '-', },
        {
            header: 'Длительность',
            accessorFn: row => {
                const duration = row?.banquetData?.durationInMinutes;
                if (duration != null && !isNaN(duration)) {
                    const hours = Math.floor(duration / 60);
                    const minutes = duration % 60;
                    return `${hours} ч. ${minutes} мин.`;
                }
                return '-';
            },
            size: 140
        },
        { header: 'Номер заказа', accessorFn: row => row.idN || '-', size: 140 },
        {
            header: 'Сумма',
            accessorFn: row => (row?.banquetData?.order?.items || []).reduce((acc, { price, amount }) => acc + (Number(price) * Number(amount)), 0).toFixed(2),
            size: 120
        },
        { header: 'Внесено', accessorFn: row => (row?.payments?.reduce((result, { sum }) => result + (sum as number), 0) || 0), size: 120 },
    ]

    const table = useMantineReactTable({
        //Based
        autoResetPageIndex: false,
        columns: columns,
        data: banquetsHistory,
        enableBottomToolbar: false,
        enableGlobalFilterModes: true,
        enablePagination: false,
        enableRowNumbers: false,
        mantineTableContainerProps: { style: { maxHeight: '800px' } },
        mantinePaperProps: { style: { borderRadius: 12 } },
        onSortingChange: setSorting,
        state: { isLoading, sorting },
        localization: MRT_Localization_RU,

        enableRowActions: true,
        positionActionsColumn: 'last',
        renderRowActions: ({ row }) => (
            // <Tooltip label="Delete">
            //     <ActionIcon color="red" onClick={() => console.log(row)}>
            //         <IconTrash />
            //     </ActionIcon>
            // </Tooltip>
            <ActionsMenu data={row.original} type='portal' />
        ),
        //Virtualization
        enableRowVirtualization: true,
        rowVirtualizerOptions: { overscan: 5 },
        rowVirtualizerInstanceRef: rowVirtualizerInstanceRef,
    })

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setBanquetsHistory(props.banquetsHistory)
            setIsLoading(false)
        }
    }, [props.banquetsHistory])

    useEffect(() => {
        try {
            rowVirtualizerInstanceRef.current?.scrollToIndex?.(0)
        } catch (error) {
            console.error(error)
        }
    }, [sorting])

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
                                    <Button variant="transparent" color='blue' radius={'md'} size="sm" py={2}
                                        onClick={() => {
                                            overlayL.open()
                                            router.push('/admin/banquet-management', undefined, { shallow: true })
                                                .finally(() => overlayL.close())
                                        }}
                                    >Банкеты в работе</Button>
                                    <Button variant="filled" color='blue' radius={'md'} size="sm" py={2}>История</Button>
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
                                router.push('/admin/banquet-management', undefined, { shallow: true })
                                    .finally(() => overlayL.close())
                            }}
                        >
                            Назад
                        </Button>
                    </Group>

                    <Stack px={24} py={12}>
                        <Text mx={'auto'} fw={700} fz={20} mt={24}>История банкетов</Text>
                        {/* <Divider my={'sm'} /> */}
                        <MantineReactTable {...{ table: table } as any} />
                    </Stack>
                </div>
            </ClientProviderLayout>
        </>
    )
}


export default withAdminPage(BanquetHistoryPage)