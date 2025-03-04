import React, { useEffect, useRef, useState } from 'react'
import ReactModal from 'react-modal'
import { ReactSVG } from 'react-svg'
import { useRouter } from 'next/router'
import { ICServiceOrderProps, IPaymentData, ServiceOrderBadge, ServiceOrderItem } from './ServiceOrder'
import { Button, Text, LoadingOverlay, Stack, Table, Badge, Paper, Group } from '@mantine/core'
import { DEFAULTS } from 'defaults'
import { IOrder, IOrderIikoProduct, TOrderStatus } from 'types/order'
import { axiosInstance } from 'helpers/axiosInstance'
import { useAdminOrders } from 'context/admin/OrderContext'
import toast from 'react-hot-toast'
import { useIiko } from 'context/IikoContext'
import { getPaymentStatus, getPaymentType } from 'helpers/getPaymentType'
import dynamic from 'next/dynamic'
import { MRT_ColumnDef, MRT_Row, MRT_RowVirtualizer, MRT_SortingState, useMantineReactTable } from 'mantine-react-table'

import { MRT_Localization_RU } from 'mantine-react-table/locales/ru/index.cjs'
import { set } from 'zod'
import { updateOrderRequest } from 'helpers/order/order'
import { notify } from 'utils/notify'
import { RiErrorWarningLine } from 'react-icons/ri'
import CancelOrderModal from './CancelModal'

const MantineReactTable = dynamic(() => import('mantine-react-table').then((mod) => mod.MantineReactTable), { ssr: false })

ReactModal.setAppElement('#__next') // Для Next.js обычно это #__next, для create-react-app это #root

interface AdminOrderModalProps {
    isOpen: boolean,
    onClose: () => void,
    order: ICServiceOrderProps
    payments?: IPaymentData[]
}

const AdminOrderModal = (props: AdminOrderModalProps) => {
    const router = useRouter()

    const { dispatch } = useAdminOrders()
    const [visibleLoadingOverlay, setVisibleLoadingOverlay] = useState(false)
    const [productList, setProductList] = useState<IOrderIikoProduct[]>([])
    const { nomenclature } = useIiko()
    const [isLoading, setIsLoading] = useState(true)
    const [sorting, setSorting] = useState<MRT_SortingState>([])
    const [cancelIsVisible, setCancelIsVisible] = useState(false)
    const [approveIsVisible, setApproveIsVisible] = useState(false)
    const [approveInnerIsVisible, setApproveInnerIsVisible] = useState(false)

    const [modalOrder, setModalOrder] = useState<ICServiceOrderProps>(props.order)
    const [paymentData, setPaymentData] = useState<IPaymentData[] | undefined>(undefined)

    const targetPayment = paymentData?.length > 0 ? paymentData[0] : null


    useEffect(() => console.log({ modalOrder }), [modalOrder])

    const columns: MRT_ColumnDef<IOrderIikoProduct>[] = [
        { header: 'Название', accessorFn: row => nomenclature?.products.find(p => p.id === row.product)?.name || '-', size: 160 },
        { header: 'Кол-во', accessorFn: row => row.quantity || 0, size: 120 },
        { header: 'Цена', accessorFn: row => row.price || 0, size: 140 },
        {
            header: 'Сумма',
            accessorFn: row => (row.price || 0) * (row.quantity || 1),
            size: 120
        },
    ]

    const [selectedRows, setSelectedRows] = useState(
        Object.fromEntries(props.order.order?.iikoProducts?.map((_, index) => [index, true]))
    )

    const table = useMantineReactTable({
        //Based
        autoResetPageIndex: false,
        columns: columns,
        data: productList,
        enableBottomToolbar: false,
        enableGlobalFilterModes: false,
        enableRowNumbers: false,
        // enableTopToolbar: false,

        enableRowSelection: true,
        enableColumnActions: false,
        enableColumnFilters: false,
        enablePagination: false,
        enableSorting: false,
        enableStickyHeader: true,
        mantineTableContainerProps: { style: { maxHeight: '340px', overflow: 'scroll' } },
        mantinePaperProps: { style: { borderRadius: 12 } },
        onSortingChange: setSorting,
        state: { isLoading, sorting, rowSelection: selectedRows },
        localization: MRT_Localization_RU,

        enableRowActions: false,
        positionActionsColumn: 'last',
        initialState: {
            rowSelection: Object.fromEntries(props.order.order?.iikoProducts?.map((_, index) => [index, true]))
        },

        onRowSelectionChange: newSelectedRows => {
            if (typeof newSelectedRows === 'function') {
                setSelectedRows(prev => {
                    console.log(newSelectedRows(prev))
                    return newSelectedRows(prev)
                })
            } else {
                console.log(newSelectedRows)
                setSelectedRows(newSelectedRows)
            }
        },
        getRowId: (row, index) => index.toString(),
        renderTopToolbar: ({ table }) => (
            <Group p={12} gap={24}>
                <Button color='green' variant='filled' style={{ height: 'fit-content' }}
                    onClick={() => {
                        const rowSelection = table.getState().rowSelection; //read state
                        const selected = table.getSelectedRowModel().rows; //or read entire rows
                        console.log({ rowSelection, selected });
                        getApprove(selected)
                    }}
                >
                    Принять
                </Button>

                <Button color='gray' variant='outline' style={{ height: 'fit-content' }}
                    onClick={() => {
                        setApproveIsVisible(false)
                        setApproveInnerIsVisible(false)
                    }}
                >
                    Закрыть
                </Button>
            </Group >
        ),

        // //Virtualization
        // enableRowVirtualization: true,
        // rowVirtualizerOptions: { overscan: 5 },
        // rowVirtualizerInstanceRef: rowVirtualizerInstanceRef,
    })
    async function updateStatus(status: TOrderStatus, newStatus: TOrderStatus) {
        if (!props.order?.order?.approve) return
        console.log('trigger updateStatus', { status, newStatus })
        setVisibleLoadingOverlay(true)
        try {
            const response = await axiosInstance.put('/api/order/update',
                {
                    data: {
                        order: {
                            ...props.order.order,
                        },
                        status,
                        newStatus
                    }
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

            props.onClose()
            setVisibleLoadingOverlay(false)
            // const data = await response.json();
            console.log('Status update: ', response.data)
            dispatch({
                type: 'UPDATE_ORDER_STATUS',
                payload: {
                    orderId: props.order.order.id,
                    status: response.data.newData.data.attributes.status,
                    previous_status: response.data.newData.data.attributes.previous_status,
                }
            })
            // return data;
            return
        } catch (error) {
            console.error('Ошибка:', error);
            throw error;
        }
    }

    async function updateOrder(order: IOrder) {
        console.log({ order, selectedRows })

        setModalOrder(prev => ({
            ...prev,
            order: order
        }))
        setProductList(order.iikoProducts)
        // return

        setVisibleLoadingOverlay(true)
        try {
            const response = await updateOrderRequest(order)

            if (response.status !== 200) {
                toast.error('Ошибка при обновлении заказа')
                setVisibleLoadingOverlay(false)
                throw new Error('Ошибка при обновлении заказа')
            }

            setVisibleLoadingOverlay(false)
            // const data = await response.json();
            console.log('Status update: ', response.data)
            dispatch({
                type: 'UPDATE_ORDER',
                payload: {
                    orderId: props.order.order.id,
                    updatedOrder: order
                }
            })
            // return data;
            return
        } catch (error) {
            console.error('Ошибка:', error);
            throw error;
        }
    }

    const openApprove = () => {
        if (props.order?.order?.paymentType === 'external' && (!targetPayment || targetPayment?.status === 'pending')) {
            notify({
                icon: <RiErrorWarningLine />,
                title: 'Действие недоступно.',
                message: 'Для подтверждения заказа необходимо дождаться оплаты',
            })
            console.log({ targetPayment })
            return
        }
        setApproveIsVisible(true)
        const t = setTimeout(() => setApproveInnerIsVisible(true), 10)
        return () => clearTimeout(t)
    }

    const getApprove = async (sel: MRT_Row<IOrderIikoProduct>[]) => {
        const newOrder: IOrder = {
            ...modalOrder.order,
            approve: true,
            iikoProducts: modalOrder.order?.iikoProducts.map((x) =>
                sel.every(r => !((r.original.product === x.product) && r.original.quantity === x.quantity))
                    ? { ...x, stoplist: true }
                    : { ...x, stoplist: false }
            ),
        }


        await updateOrder(newOrder)

        setApproveIsVisible(false)
        setApproveInnerIsVisible(false)
    }

    const openCancel = () => {
        setCancelIsVisible(true)
    }

    const closeCancel = () => {
        setCancelIsVisible(false)
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setProductList(props.order.order?.iikoProducts)
            setIsLoading(false)
        }
    }, [props.order.order?.iikoProducts, props.isOpen])

    useEffect(() => {
        if (!modalOrder) {
            setModalOrder(props.order)
        }
    }, [props.order, props.isOpen])

    useEffect(() => {
        if (props.order.order.id && props.order.order.paymentType === 'external' && props.isOpen) {
            const fetchPayment = async () => {
                const payment = await axiosInstance.post(`/api/order/payments/${props.order.order.id}`)
                console.log(`Payment for order ${props.order.order.id}:`, { payment: payment.data })
                setPaymentData(payment.data)
            }
            fetchPayment()
        }
    }, [props.order, props.isOpen])

    const rows =
        modalOrder.order.store.store_type?.value === 'eat'
            ? modalOrder.order.iikoProducts.map((x, i) => {
                const product = nomenclature?.products.find(p => p.id === x.product)
                // const product = props.order.products.find(p => parseInt(p.id) === x.id)
                // console.log('nomenclature ', nomenclature)
                // console.log('product', product)
                return (
                    <Table.Tr
                        key={product?.name + i + x.quantity * x?.price}
                        style={x?.stoplist ? { position: 'relative', background: 'rgb(255 0 20 / 30%)' } : {}}
                    >
                        <Table.Td style={{ position: 'relative', }}>
                            {x?.stoplist ? <Paper style={{
                                position: 'absolute',
                                left: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                right: 0,
                                height: 1,
                                background: '#f23'
                            }}></Paper> : <></>}
                            {product?.name}
                        </Table.Td>
                        <Table.Td mah={50}>
                            {x?.stoplist ? <Paper style={{
                                position: 'absolute',
                                left: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                right: 0,
                                height: 1,
                                background: '#f23'
                            }}></Paper> : <></>}
                            {x.quantity}
                        </Table.Td>
                        <Table.Td>
                            {x?.stoplist ? <Paper style={{
                                position: 'absolute',
                                left: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                right: 0,
                                height: 1,
                                background: '#f23'
                            }}></Paper> : <></>}
                            {x?.price}
                        </Table.Td>
                        <Table.Td>
                            {x?.stoplist ? <Paper style={{
                                position: 'absolute',
                                left: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                right: 0,
                                height: 1,
                                background: '#f23'
                            }}></Paper> : <></>}
                            {x.quantity * x?.price}
                        </Table.Td>
                    </Table.Tr>
                )
            })
            : modalOrder.order.products.map((x, i) => {
                const product = modalOrder.products.find(p => parseInt(p.id) === x.id)
                return (
                    <Table.Tr key={product?.name + i + x.quantity * product?.price}>
                        <Table.Td>{product?.name}</Table.Td>
                        <Table.Td mah={50}>{x.quantity}</Table.Td>
                        <Table.Td>{product?.price}</Table.Td>
                        <Table.Td>{x.quantity * product?.price}</Table.Td>
                    </Table.Tr>
                )
            })

    const total = props.order.order.store.store_type?.value === 'eat'
        ?
        modalOrder.order.iikoProducts.filter(e => !e.stoplist).reduce((total, x) => {
            return total + x?.price * x.quantity
        }, 0)
        :
        props.order.order.products.reduce((total, x) => {
            const product = props.order.products.find(p => parseInt(p.id) === x.id)
            return total + product?.price * x.quantity
        }, 0)

    const orderTotal = total + (props.order.order.store?.fee
        ? props.order.order.store?.fee.type === 'fix' ? props.order.order.store?.fee.value : total * props.order.order.store.fee.value / 100 : 0)

    return (
        <ReactModal
            isOpen={props.isOpen}
            onRequestClose={props.onClose}
            className="OrderAdmin-Modal"
            overlayClassName="Overlay"
        // shouldCloseOnOverlayClick={false}
        >
            <CancelOrderModal
                isOpen={cancelIsVisible}
                onClose={closeCancel}
                order={props.order}
            />
            <LoadingOverlay
                visible={visibleLoadingOverlay}
                zIndex={1000}
                overlayProps={{ radius: 'md', blur: 2 }}
                loaderProps={{ color: 'gray', type: 'oval' }}
            />
            <div className='OrderAdmin-Modal__header'>
                <div className='OrderAdmin-Modal__header-content'>
                    Управление заказом
                    <ReactSVG className='OrderAdmin-Modal__close' style={{ cursor: 'pointer' }} src='/svg/admin/admin_modal-close.svg' onClick={props.onClose} />
                </div>
            </div>

            <div className='OrderAdmin-Modal__main' style={{ position: 'relative' }}>
                {cancelIsVisible ? <Stack pos={'fixed'} left={24} right={24} top={'80px'} bottom={0} bg={'rgb(255 255 255 / 60%)'} style={{
                    zIndex: 100,
                    borderRadius: '12px 12px 0 0 ',
                    overflow: 'hidden',
                    backdropFilter: 'blur(2px)',
                    transition: 'all .24s ease-in-out',
                }}>
                    <Stack style={{
                        transition: 'all .4s ease-in-out',
                        borderRadius: '12px 12px 0 0 ',
                        overflowY: 'scroll',
                        overflowX: 'hidden',
                    }}
                        justify='flex-start'
                        p={24}
                        w={'100%'} h={'fit-content'}
                        bg={'#EEF0F5'}
                        c={'#262E4A'}
                    >
                        <Text fw={700} fz={18}>Проверка заказа</Text>

                        <Stack flex={'1 1 0'} mah={'calc(100% - 48px)'}>
                            <Group></Group>
                        </Stack>

                    </Stack>
                </Stack>
                    : <></>}

                {approveIsVisible ? <Stack pos={'fixed'} left={24} right={24} top={'80px'} bottom={0} bg={'rgb(255 255 255 / 60%)'} style={{
                    zIndex: 100,
                    borderRadius: '12px 12px 0 0 ',
                    overflow: 'hidden',
                    backdropFilter: 'blur(2px)',
                    transition: 'all .24s ease-in-out',
                }}>
                    <Stack style={{
                        transition: 'all .4s ease-in-out',
                        borderRadius: '12px 12px 0 0 ',
                        overflowY: 'scroll',
                        overflowX: 'hidden',
                    }}
                        justify='flex-start'
                        p={24}
                        w={'100%'} h={approveInnerIsVisible ? '100%' : '0%'}
                        bg={'#EEF0F5'}
                        c={'#262E4A'}
                    >
                        <Text fw={700} fz={18}>Проверка заказа</Text>

                        <Stack flex={'1 1 0'} mah={'calc(100% - 48px)'}>
                            <MantineReactTable {...{ table: table } as any} />
                        </Stack>

                    </Stack>
                </Stack>
                    : <></>}
                <LoadingOverlay
                    visible={approveIsVisible}
                    zIndex={99}
                    overlayProps={{ radius: 'md', blur: 2 }}
                    loaderProps={{ color: 'gray', type: 'oval' }}
                />
                <div className='OrderAdmin-Modal__main-section left-section'>
                    <div className='OrderAdmin-Modal__info AdminModal-block'>
                        {/* {props.order.order.status + ' ' + props.order.order.id} */}
                        <Stack style={{ position: 'relative', borderRadius: 0, borderBottom: '1px solid rgb(38, 46, 74)' }} h={37} px={0} mt={-10}>
                            <ServiceOrderBadge order={props.order.order} min />
                        </Stack>
                        <div className='OrderAdmin-Modal__info-header'>
                            <span className='OrderAdmin-Modal__info-title'>Заказ от {props.order.order.guest?.name ? props.order.order.guest?.name : 'гостя'}</span>
                            <span className='OrderAdmin-Modal__info-subtitle'>
                                {props.order.order.room?.label ? props.order.order.room?.label : 'Свяжитесь с гостем для уточнения'}
                            </span>
                        </div>
                        <div className='OrderAdmin-Modal__info-section'>
                            <div className='column'>
                                <span className='title'>Комментарий</span>
                                <span className='value'>{props.order.order.comment ? props.order.order.comment : 'Нет комментария'}</span>
                            </div>
                        </div>
                        <div className='OrderAdmin-Modal__info-section'>
                            <div className='row'>
                                <span className='title'>Телефон для связи</span>
                                <span className='value'>{props.order.order.guest.phone}</span>
                            </div>
                        </div>
                        <div className='OrderAdmin-Modal__info-section'>
                            <div className='row'>
                                <span className='title'>Сумма заказа</span>
                                <span className='value'>{
                                    props.order.order.store.store_type?.value === 'eat'
                                        ?
                                        modalOrder.order.iikoProducts.filter(e => !e.stoplist).reduce((total, x) => {
                                            return total + x?.price * x.quantity
                                        }, 0)
                                        :
                                        props.order.order.products.reduce((total, x) => {
                                            const product = props.order.products.find(p => parseInt(p.id) === x.id)
                                            return total + product?.price * x.quantity
                                        }, 0)
                                } руб.</span>
                            </div>
                            {props.order.order.store?.fee ?
                                <Group w={'100%'} justify='space-between'>
                                    <Text c={'#8C8DA8'} fw={500}>{props.order.order.store?.fee?.name}</Text>
                                    <Group wrap='nowrap' gap={4}>
                                        <Text c={'#262E4A'}>({props.order.order.store?.fee?.value}{props.order.order.store?.fee?.type === 'fix' ? ' ₽' : '%'})</Text>
                                        <Text c={'#262E4A'} fw={600}>{total * props.order.order.store?.fee?.value / 100} ₽</Text>
                                    </Group>
                                </Group>
                                : <></>
                            }
                            <div className='row'>
                                <span className='title'>Итого</span>
                                <span className='value'>{orderTotal} руб.</span>
                            </div>

                            <div className='row'>
                                <span className='title'>Способ оплаты</span>
                                <span className='value'>{getPaymentType({ order: props.order.order, type: 'staff' })}</span>
                            </div>
                            {props.order?.order.paymentType === 'external' ?
                                <Group w={'100%'}>
                                    <Badge ml={'auto'} autoContrast variant="light" color={props.order?.order.paid_for ? 'teal' : 'orange'}
                                        className='admin-serviceCard__badge'>
                                        {getPaymentStatus({ status: targetPayment?.status }).staff}
                                    </Badge>
                                </Group>
                                : <></>}
                        </div>
                    </div>

                </div>


                <div className='OrderAdmin-Modal__main-section right-section'>
                    <Stack px={24} py={12} gap={0} bg={'#EEF0F5'} style={{ borderRadius: 12 }}>
                        <span className='AdminModal-block__header-title'>Действия</span>

                        <div className='OrderAdmin-Modal__actions-content' style={{ position: 'relative' }}>
                            {!props.order?.order?.approve ?
                                <Group wrap='nowrap' w={'100%'}>
                                    <Button size='md' variant="filled" color="green" style={{
                                        padding: '0 12px',
                                        height: 48,
                                        flex: '1 1 0 ',
                                        background: props.order.order.status === 'canceled' && '#252525'
                                    }}
                                        onClick={openApprove}
                                        disabled={props.order.order.status === 'canceled'}
                                    >
                                        <Text fw={600}>Проверить</Text>
                                    </Button>
                                    <Button size='md' variant="filled" color="red" style={{
                                        padding: '0 12px',
                                        height: 48,
                                        flex: '1 1 0 ',
                                        background: props.order.order.status === 'canceled' && '#252525'
                                    }}
                                        onClick={openCancel}
                                        disabled={props.order.order.status === 'canceled'}
                                    >
                                        <Text fw={600}>Отменить</Text>
                                    </Button>
                                </Group>
                                :
                                <Group>
                                    <Button px={12} onClick={() => updateStatus(props.order.order.status, 'inwork')} variant="filled" color="blue" size='md' radius={'md'}
                                        style={{ fontSize: 14, fontWeight: 500 }}>Принять</Button>
                                    <Button px={12} onClick={() => updateStatus(props.order.order.status, 'delivered')} variant="filled" color="orange" size='md' radius={'md'}
                                        style={{ fontSize: 14, fontWeight: 500 }}>Доставка</Button>
                                    <Button px={12} onClick={() => updateStatus(props.order.order.status, 'done')} variant="filled" color={'green'} size='md' radius={'md'}
                                        style={{ fontSize: 14, fontWeight: 500 }}>Выполнен</Button>
                                </Group>
                            }
                        </div>
                    </Stack>
                    <div className='OrderAdmin-Modal__table AdminModal-block'>
                        <div className='AdminModal-block__header' style={{ position: 'relative' }}>
                            <span className='AdminModal-block__header-title'>Таблица заказа</span>
                            <Badge autoContrast variant="light" color={props.order?.order?.approve ? 'teal' : 'red'}
                                className='admin-serviceCard__badge'
                                pos={'absolute'}
                                right={0}
                                top={0}
                            >
                                {props.order?.order?.approve ? 'подтвержден' : 'требуется проверка'}
                            </Badge>
                        </div>
                        <div className='OrderAdmin-Modal__table-content'>
                            <div className='OrderAdmin-Modal__table-wrapper'>
                                <Table.ScrollContainer minWidth={500}>
                                    <Table striped withTableBorder styles={{
                                        table: {
                                            borderRadius: '12px',
                                            color: '#252525'
                                        },
                                        th: {
                                            background: '#a0bcd5'
                                        },
                                    }}>
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th>Название</Table.Th>
                                                <Table.Th style={{ maxWidth: 70, wordBreak: 'break-all' }}>Кол-во</Table.Th>
                                                <Table.Th>Цена за ед.</Table.Th>
                                                <Table.Th style={{ maxWidth: 100, wordBreak: 'break-all' }}>Сумма</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {rows}
                                            <Table.Tr>
                                                <Table.Td></Table.Td>
                                                <Table.Td></Table.Td>
                                                <Table.Td></Table.Td>
                                                {/* <Table.Td style={{
                                                    fontWeight: 600,
                                                    fontSize: 18,
                                                    whiteSpace: 'nowrap',
                                                    maxWidth: 100,
                                                    display: 'flex',
                                                    justifyContent: 'flex-end',
                                                }}>
                                                    Сумма заказа {total} руб.</Table.Td> */}
                                            </Table.Tr>
                                        </Table.Tbody>
                                    </Table>
                                </Table.ScrollContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ReactModal >
    )
}

export default AdminOrderModal
