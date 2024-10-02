'use client';

import { Text, ActionIcon, Table, Tooltip, rem, Flex, Button, Checkbox, Group } from '@mantine/core'
import { modals } from '@mantine/modals'

import { IconGripVertical, IconTrash } from '@tabler/icons-react'
import classes from '/styles/components/OrderTable.module.sass'
import React, { CSSProperties, SetStateAction, useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { createRow, MRT_ColumnDef, MRT_Row, MRT_RowVirtualizer, MRT_SortingState, useMantineReactTable } from 'mantine-react-table'
// import { MRT_Localization_RU } from 'mantine-react-table/locales/ru'
import { useDisclosure } from '@mantine/hooks'
import MenuModal from './MenuModal'
import { v4 as uuidv4 } from 'uuid'

import { MRT_Localization_RU } from 'mantine-react-table/locales/ru/index.cjs'
import { IBanquetOrderItem, ItemMenuV2, ReserveCreateRequest } from 'helpers/iiko/IikoApi/types';
import { useIiko } from 'context/IikoContext';
import { IBanquetOrderItemWithState } from 'types/admin/banquets';
const MantineReactTable = dynamic(() => import('mantine-react-table').then((mod) => mod.MantineReactTable), { ssr: false })

interface IData {
    id: string;
    key: string;
    name: string;
    amount: number;
    unit: string;
    price: string;
    sum: string;
    comment: string;
    isCounting: boolean
}

interface RowProps {
    data: IData[];
    index: number;
    style: CSSProperties;
}


const openDeleteConfirmModal = (row, onCall) =>
    modals.openConfirmModal({
        title: 'Вы точно хотите удалить это блюдо?',
        children: (
            <Text inline>
                Вы точно хотите удалить <span style={{ fontWeight: 700 }}>{row.original.name}</span>{' '}?.
            </Text>
        ),
        labels: { confirm: 'Удалить', cancel: 'Отмена' },
        confirmProps: { color: 'red', variant: 'filled', py: 12, h: 42 },
        cancelProps: { color: 'blue', variant: 'outline', py: 12, h: 42 },
        onConfirm: () => {
            // console.log('deleted ', row)
            // deleteUser(row.original.id)
            onCall()
        },
    });


interface OrderTableProps {
    onOrderChanged: (newValue: SetStateAction<ReserveCreateRequest>) => void
    data?: ReserveCreateRequest
}

export function OrderTable(props: OrderTableProps) {
    const [items, setItems] = useState<IBanquetOrderItem[]>([])
    const [tableData, setTableData] = useState<IData[]>([])
    const [allItems, setAllItems] = useState<ItemMenuV2[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [sorting, setSorting] = useState<MRT_SortingState>([])
    const [openedMenuModal, { open: openMenuModal, close: closeMenuModal }] = useDisclosure(false)
    const tableContainerRef = useRef<HTMLTableSectionElement>(null)

    const iiko = useIiko()

    const rowVirtualizerInstanceRef = useRef<MRT_RowVirtualizer>(null)


    const columns: MRT_ColumnDef<IData>[] = [
        { accessorKey: 'name', header: 'Название', size: 400, enableEditing: false },
        {
            accessorKey: 'amount', header: 'Количество', size: 60,
            mantineEditTextInputProps: ({ cell }) => ({
                type: 'number',
                required: true,
                onBlur: (event) => {
                    const value = event.target.value
                    props.onOrderChanged(p => {
                        let newItems = [...p.order.items]
                        newItems[cell.row.index].amount = parseInt(value ? value : '1')
                        return ({
                            ...p,
                            order: {
                                ...p.order,
                                items: newItems
                            }
                        })
                    })
                },
            }),
        },
        { accessorKey: 'unit', header: 'Ед. измерения', size: 140, enableEditing: false },
        {
            accessorKey: 'price', header: 'Цена за шт.', size: 120,
            mantineEditTextInputProps: ({ cell }) => ({
                type: 'number',
                required: true,
                onBlur: (event) => {
                    const value = event.target.value
                    props.onOrderChanged(p => {
                        let newItems = [...p.order.items]
                        newItems[cell.row.index].price = value
                        return ({
                            ...p,
                            order: {
                                ...p.order,
                                items: newItems
                            }
                        })
                    })
                },
            }),
        },
        { accessorKey: 'sum', header: 'Сумма', size: 120, enableEditing: false },
        {
            accessorKey: 'comment', header: 'Комментарий',
            mantineEditTextInputProps: ({ cell }) => ({
                type: 'text',
                required: true,
                onBlur: (event) => {
                    const value = event.target.value
                    props.onOrderChanged(p => {
                        let newItems = [...p.order.items]
                        newItems[cell.row.index].comment = value
                        return ({
                            ...p,
                            order: {
                                ...p.order,
                                items: newItems
                            }
                        })
                    })
                },
            }),
        },
    ]

    useEffect(() => {
        if (iiko.menu) {
            const ai = iiko.menu?.itemCategories.flatMap(category => category.items)
            setAllItems(ai)
            setTableData(() => ((props.data?.order?.items as IBanquetOrderItemWithState[])?.map((item, i) => ({
                id: `${item?.productId}`,
                key: uuidv4(),
                name: ai.find(im => im.itemId === item?.productId)?.name || '-',
                amount: item?.amount,
                unit: ai.find(im => im.itemId === item?.productId)?.measureUnit || '-',
                price: `${item?.price} руб.`,
                sum: `${parseInt(item?.price) * item?.amount} руб.`,
                comment: item?.comment,
                isCounting: item?.isCounting !== false,
            }))))
            setIsLoading(false)
        }
    }, [iiko.menu, props.data])

    const table = useMantineReactTable({
        //Based
        autoResetPageIndex: false,
        columns: columns,
        data: tableData,
        enableBottomToolbar: false,
        enableGlobalFilterModes: true,
        enablePagination: false,
        enableRowNumbers: true,
        mantineTableContainerProps: { style: { maxHeight: '70vh' } },
        mantinePaperProps: { style: { borderRadius: 12 } },
        onSortingChange: setSorting,
        state: {
            isLoading: isLoading && iiko.isLoading,
            sorting
        },
        localization: MRT_Localization_RU,

        //DnD
        enableRowOrdering: true,
        enableSorting: false,
        mantineTableBodyProps: {
            ref: tableContainerRef
        },
        mantineRowDragHandleProps: ({ table, row }) => ({
            onDragStart: () => {
                console.log('onDragStart: ', row)
            },
            onDragEnd: () => {
                const { draggingRow, hoveredRow } = table.getState();
                if (hoveredRow && draggingRow) {
                    tableData.splice(
                        (hoveredRow as MRT_Row<IData>).index,
                        0,
                        tableData.splice(draggingRow.index, 1)[0],
                    );
                    setTableData([...tableData])

                    const newPropData = props.data?.order?.items
                    newPropData.splice(
                        (hoveredRow as MRT_Row<IData>).index,
                        0,
                        newPropData.splice(draggingRow.index, 1)[0]
                    )

                    console.log('newPropData: ', newPropData)

                    // props.data.order.items.splice()

                    props.onOrderChanged(p => ({
                        ...p,
                        order: {
                            ...p.order,
                            items: newPropData
                        }
                    }))
                }
            },
        }),

        //Editing
        createDisplayMode: 'row', // ('modal', and 'custom' are also available)
        editDisplayMode: 'cell', // ('modal', 'row', 'cell', and 'custom' are also available)
        enableEditing: true,
        enableRowActions: true,
        positionActionsColumn: 'last',
        // onCreatingRowCancel: () => setValidationErrors({}),
        // onCreatingRowSave: handleCreateUser,
        renderRowActions: ({ row }) => (
            <Group gap={8}>
                <Tooltip label="Удалить">
                    <ActionIcon color="red"
                        onClick={() => openDeleteConfirmModal(row, () => {
                            tableData.splice(row.index, 1)
                            setTableData([...tableData])

                            const newPropData = props.data?.order?.items
                            newPropData.splice(row.index, 1)

                            props.onOrderChanged(p => ({
                                ...p,
                                order: {
                                    ...p.order,
                                    items: newPropData
                                }
                            }))
                        })}>
                        <IconTrash />
                    </ActionIcon>
                </Tooltip >
                <Tooltip label="Учитывать в калькуляторе?">
                    <Checkbox
                        defaultChecked={tableData[row.index].isCounting}
                        size="md"
                        onChange={(event) => {
                            console.log(event)
                            tableData[row.index].isCounting = event.target.checked
                            setTableData([...tableData])

                            const newPropData = props.data?.order?.items as IBanquetOrderItemWithState[]
                            newPropData[row.index].isCounting = event.target.checked
                            console.log(newPropData[row.index])
                            props.onOrderChanged(p => ({
                                ...p,
                                order: {
                                    ...p.order,
                                    items: newPropData
                                }
                            }))
                        }}
                    />
                </Tooltip >
            </Group>
        ),
        renderTopToolbarCustomActions: ({ table }) => (
            <Button color='blue' py={8} variant='filled' radius={'md'} onClick={() => {
                // table.setCreatingRow(true)
                openMenuModal()
            }}>
                Добавить блюдо
            </Button>
        ),
        //Virtualization
        enableRowVirtualization: true,
        rowVirtualizerOptions: { overscan: 10 },
        rowVirtualizerInstanceRef: rowVirtualizerInstanceRef,
    })

    const onSelectItem = (item: ItemMenuV2) => {
        props.onOrderChanged(p => ({
            ...p,
            order: {
                ...p.order,
                items: [
                    ...p.order.items,
                    {
                        amount: 1,
                        price: (item?.itemSizes[0]?.prices[0]?.price ? item?.itemSizes[0]?.prices[0]?.price : 0).toString(),
                        productId: item?.itemId,
                        comment: '',
                        type: 'Product',
                    }
                ]
            }
        }))
        closeMenuModal()
    }

    useEffect(() => {
        try {
            rowVirtualizerInstanceRef.current?.scrollToIndex(0)
        } catch (e) {
            console.log(e)
        }
    }, [sorting])

    return (
        <>
            <MenuModal opened={openedMenuModal} close={closeMenuModal} onSelectItem={onSelectItem} />
            <MantineReactTable {...{ table: table } as any} />
        </>
    )
}