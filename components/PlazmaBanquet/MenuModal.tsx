'use client';

import { Button, Stack, Grid, Text, Divider, Group } from '@mantine/core'
import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
// import { MRT_Localization_RU } from 'mantine-react-table/locales/ru'
import { MRT_ColumnDef, MRT_RowVirtualizer, MRT_SortingState, useMantineReactTable } from 'mantine-react-table'
import { useIiko } from 'context/IikoContext'
import { ItemMenuV2, MenuV2ByIdResponse } from 'helpers/iiko/IikoApi/types'
import { MRT_Localization_RU } from 'mantine-react-table/locales/ru/index.cjs'

const Modal = dynamic(() => import('@mantine/core').then((mod) => mod.Modal), { ssr: false })
const MantineReactTable = dynamic(() => import('mantine-react-table').then((mod) => mod.MantineReactTable), { ssr: false })

interface MenuModalProps {
    opened: boolean
    close: () => void
    onSelectItem: (item: ItemMenuV2) => void
}

export default function MenuModal({ opened, close, onSelectItem }: MenuModalProps) {
    const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null)
    const [sorting, setSorting] = useState<MRT_SortingState>([])

    const [isLoading, setIsLoading] = useState(true)
    const iiko = useIiko()


    const columns: MRT_ColumnDef<ItemMenuV2>[] = [
        { accessorKey: 'name', header: 'Название', size: 400 },
        { accessorKey: 'measureUnit', header: 'Ед. измерения', size: 140 },
        { accessorFn: item => item.itemSizes[0]?.prices[0]?.price ? `${item.itemSizes[0]?.prices[0]?.price} руб.` : `-`, header: 'Цена за шт.', size: 120 },
    ]

    const [tabData, setTabData] = useState([]);
    const [currentTab, setCurrentTab] = useState(tabData[0]?.id || '-1');
    const [items, setItems] = useState(
        (iiko.menu as MenuV2ByIdResponse)?.itemCategories.find((cat) => cat.id === currentTab)?.items || []
    )




    // useEffect(() => {
    //     console.log('useEffect menu')
    //     console.log('opened: ' + opened)
    //     console.log('iiko.menu: ', { 'iiko.menu': iiko })
    //     if (opened && iiko.menu) {
    //         if (tabData.length > 0 && currentTab && items.length > 0) return;

    //         if (tabData.length === 0) {
    //             const newTabData = iiko.menu.itemCategories.map((category, i) => ({
    //                 id: category.id,
    //                 label: category.name,
    //                 value: i,
    //                 data: [],
    //             }));
    //             newTabData.unshift({
    //                 id: '-1',
    //                 label: 'Все',
    //                 value: -1,
    //                 data: [],
    //             })

    //             console.log('setTabData: ', newTabData);
    //             setTabData(newTabData);
    //             return;
    //         }

    //         if (!currentTab && tabData.length > 0) {
    //             console.log('setCurrentTab: ', tabData[0]?.id);
    //             setCurrentTab(tabData[0]?.id);
    //             return;
    //         }

    //         if (items.length === 0 && currentTab) {
    //             const newItems = iiko.menu.itemCategories.find((cat) => cat.id === currentTab)?.items || [];
    //             console.log('setItems: ', newItems);
    //             setItems(newItems);
    //             return;
    //         }
    //     }
    // }, [opened, iiko.menu, tabData, currentTab, items]);

    useEffect(() => {
        if (iiko.menu?.itemCategories) {
            // Подготовка данных для кнопок категорий
            const tabs = [
                { id: '-1', label: 'Все товары' }, // Вкладка для всех товаров
                ...iiko.menu.itemCategories.map(category => ({
                    id: category.id,
                    label: category.name,
                })),
            ]

            setTabData(tabs)
            // Изначально отображаем все товары
            const allItems = iiko.menu.itemCategories.flatMap(category => category.items);
            setItems(allItems)
        }
    }, [iiko.menu])


    const table = useMantineReactTable({
        //Based
        autoResetPageIndex: false,
        columns: columns,
        data: items,
        enableBottomToolbar: false,
        enableGlobalFilterModes: true,
        enablePagination: false,
        enableRowNumbers: false,
        enableToolbarInternalActions: true,
        mantineTableContainerProps: { style: { minHeight: 'calc(70vh - 92px)', maxHeight: 'calc(70vh - 92px)', width: '100%', borderRadius: 12 } },
        mantinePaperProps: { style: { borderRadius: 12, height: '100%' } },
        onSortingChange: setSorting,
        state: { isLoading, sorting },
        localization: MRT_Localization_RU,

        //Virtualization
        enableRowVirtualization: true,
        rowVirtualizerOptions: { overscan: 10 },
        rowVirtualizerInstanceRef: rowVirtualizerInstanceRef,
        mantineTableBodyRowProps: ({ row }) => ({
            onClick: (e) => {
                // console.log(row)
                onSelectItem(row.original)
            }
        })
    })

    const changeTab = (id: string) => {
        setCurrentTab(id);

        if (id === '-1') {
            // Собираем все товары из всех категорий
            const allItems = iiko.menu?.itemCategories.flatMap(category => category.items) || [];
            setItems(allItems);
        } else {
            // Находим категорию с указанным id и отображаем её товары
            const category = iiko.menu?.itemCategories.find(cat => cat.id === id);
            setItems(category?.items || []);
        }
    };


    useEffect(() => {
        if (iiko.menu) {
            setIsLoading(false)
        }
    }, [iiko.menu])

    useEffect(() => {
        console.log({ items })
    }, [items])


    useEffect(() => {
        try {
            rowVirtualizerInstanceRef.current?.scrollToIndex(0)
        } catch (e) {
            console.log(e)
        }
    }, [sorting])

    return (
        <Modal opened={opened} onClose={close} title={<Text size='lg' fw={700} >Выбор блюда</Text>} centered
            size={'100%'} radius={'lg'}
        >
            {/* <Divider /> */}
            <Grid columns={12} gutter="xl" mah={'70vh'}>
                <Grid.Col span={3} mah={'70vh'}>
                    <Stack w={'100%'} h={'100%'} style={{ overflowY: 'scroll', overflowX: 'hidden', borderRadius: 12 }}
                        mb='auto' py={12} px={12} bd={'1px solid #262e4a'}>
                        {tabData.map((t) => (
                            <Button
                                key={t.id}
                                onClick={() => changeTab(t.id)}
                                w={'100%'}
                                radius={'md'}
                                py={16}
                                color='#262e4a'
                                mih={'46px'}
                                h={'fit-content'}
                                variant={currentTab === t.id ? 'filled' : 'transparent'}
                            >
                                {t.label}
                            </Button>
                        ))}
                    </Stack>
                </Grid.Col>

                <Grid.Col span={9} py={18} mah={'70vh'}>
                    <MantineReactTable {...{ table: table } as any} />
                </Grid.Col>
            </Grid>
        </Modal>
    )
}