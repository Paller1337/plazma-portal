import React, { useEffect, useRef, useState } from 'react'
import ReactModal from 'react-modal'
import { ReactSVG } from 'react-svg'
import { useRouter } from 'next/router'
import { ICServiceOrderProps, IPaymentData, ServiceOrderBadge, ServiceOrderItem } from './ServiceOrder'
import { Button, Text, LoadingOverlay, Stack, Table, Badge, Paper, Group, Select, Textarea, ComboboxItem, Skeleton } from '@mantine/core'
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

const MantineReactTable = dynamic(() => import('mantine-react-table').then((mod) => mod.MantineReactTable), { ssr: false })

ReactModal.setAppElement('#__next') // Для Next.js обычно это #__next, для create-react-app это #root

interface AdminOrderModalProps {
    isOpen: boolean,
    onClose: () => void,
    order: ICServiceOrderProps
}

export interface ICancelReason {
    id: number
    name: string
    title: string
    createdAt: string
    updatedAt: string
    publishedAt: string
}

const CancelOrderModal = (props: AdminOrderModalProps) => {
    const router = useRouter()

    const { dispatch } = useAdminOrders()
    const [visibleLoadingOverlay, setVisibleLoadingOverlay] = useState(false)

    const [value, setValue] = useState<string>(null)
    const [comment, setComment] = useState<string>(null)
    const [cancelReasons, setCancelReasons] = useState<ICancelReason[]>(undefined)
    const [cancelReasonsData, setCancelReasonsData] = useState<ComboboxItem[]>(undefined)
    // const selectData = cancelReasons?.map(reason => ({ label: reason.title, value: reason.name }))

    async function cancelOrderStatus() {
        console.log('trigger updateStatus', {
            order: {
                ...props.order.order,
                cancelReason: {
                    cancel_reason: parseInt(value),
                    metadata: {
                        comment: ''
                    }
                }
            },
            status: props.order.order.status,
            newStatus: 'canceled'
        })

        if (!value) return
        // return
        // console.log('trigger updateStatus', { status, newStatus })
        setVisibleLoadingOverlay(true)
        try {
            const response = await axiosInstance.put('/api/order/update',
                {
                    data: {
                        order: {
                            ...props.order.order,
                            cancelReason: {
                                cancel_reason: parseInt(value),
                                metadata: {
                                    comment: comment
                                }
                            }
                        },
                        status: props.order.order.status,
                        newStatus: 'canceled'
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

    // async function updateOrder(order: IOrder) {
    //     console.log({ order, selectedRows })

    //     setModalOrder(prev => ({
    //         ...prev,
    //         order: order
    //     }))
    //     setProductList(order.iikoProducts)
    //     // return

    //     setVisibleLoadingOverlay(true)
    //     try {
    //         const response = await updateOrderRequest(order)

    //         if (response.status !== 200) {
    //             toast.error('Ошибка при обновлении заказа')
    //             setVisibleLoadingOverlay(false)
    //             throw new Error('Ошибка при обновлении заказа')
    //         }

    //         setVisibleLoadingOverlay(false)
    //         // const data = await response.json();
    //         console.log('Status update: ', response.data)
    //         dispatch({
    //             type: 'UPDATE_ORDER',
    //             payload: {
    //                 orderId: props.order.order.id,
    //                 updatedOrder: order
    //             }
    //         })
    //         // return data;
    //         return
    //     } catch (error) {
    //         console.error('Ошибка:', error);
    //         throw error;
    //     }
    // }

    useEffect(() => {
        if (props.isOpen) {
            const fetchReasons = async () => {
                const reasons: ICancelReason[] = (await axiosInstance.post(`/api/admin/order/cancel-reasons`))?.data
                console.log(`Reasons:`, { reasons: reasons })
                setCancelReasons(reasons)
            }
            fetchReasons()
        }
    }, [props.isOpen])

    useEffect(() => {
        if (cancelReasons && !cancelReasonsData) {
            setCancelReasonsData(() => cancelReasons.map(r => ({ value: r?.id.toString(), label: r?.title })))
        }
    }, [cancelReasons])

    const cancelOrder = () => {
        props.onClose()
    }
    return (
        <ReactModal
            isOpen={props.isOpen}
            onRequestClose={props.onClose}
            className="CancelOrder-Modal"
            overlayClassName="Overlay"
        // shouldCloseOnOverlayClick={false}
        >
            <LoadingOverlay
                visible={visibleLoadingOverlay}
                zIndex={1000}
                overlayProps={{ radius: 'md', blur: 2 }}
                loaderProps={{ color: 'gray', type: 'oval' }}
            />
            <div className='CancelOrder-Modal__header'>
                <div className='CancelOrder-Modal__header-content'>
                    Отмена заказа
                    <ReactSVG className='CancelOrder-Modal__close' style={{ cursor: 'pointer' }} src='/svg/admin/admin_modal-close.svg' onClick={props.onClose} />
                </div>
            </div>

            <div className='CancelOrder-Modal__main' style={{ position: 'relative' }}>
                <Stack gap={24} px={12} w={'100%'}>
                    {props.isOpen && cancelReasonsData?.length > 0 ? (
                        <>
                            <Select
                                description='Причина отмены'
                                placeholder="Выберите причину"
                                data={cancelReasonsData.length > 0 ? cancelReasonsData : []}
                                value={value}
                                onChange={v => setValue(v)}
                                comboboxProps={{ withinPortal: true }}
                                size='md'
                                radius='md'
                                styles={{
                                    input: {
                                        background: '#EEF0F5'
                                    },
                                    dropdown: {
                                        zIndex: 10001
                                    }
                                }}
                                allowDeselect={false}
                            />


                            <Textarea
                                description="Комментарий"
                                placeholder="При необходимости опишите причину более подробно"
                                size='md'
                                radius={'md'}
                                onChange={(event) => setComment(event.currentTarget.value)}
                                styles={{
                                    input: {
                                        background: '#EEF0F5'
                                    }
                                }}
                            />
                            <Button size='md' variant="filled" color="red" radius={'md'}
                                onClick={cancelOrderStatus} w={'fit-content'}
                            >
                                <Text fz={14} fw={500}>Отменить</Text>
                            </Button>
                        </>
                    ) :
                        (
                            <Stack gap={8}>
                                <Stack gap={8}>
                                    <Skeleton height={12} w={'70%'} radius="md" />
                                    <Skeleton height={60} w={'100%'} radius="md" />
                                </Stack>
                                <Stack gap={8}>
                                    <Skeleton height={12} w={'80%'} radius="md" />
                                    <Skeleton height={60} w={'100%'} radius="md" />
                                </Stack>
                            </Stack>
                        )
                    }

                </Stack>
            </div>
        </ReactModal >
    )
}

export default CancelOrderModal
