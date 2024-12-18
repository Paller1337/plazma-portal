import type { NextApiRequest, NextApiResponse } from 'next'
// import { updateServiceOrderStatus } from 'helpers/order/services'
import axios from 'axios'
import { DEFAULTS } from 'defaults'
import { IOrder, TOrderStatus } from 'types/order'
import { axiosInstance } from 'helpers/axiosInstance'


const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'PUT') {
            res.status(405).json({ message: 'Метод не поддерживается' })
            return;
        }

        const { order, status, newStatus } = req.body.data as { order: IOrder, status: TOrderStatus, newStatus: TOrderStatus }

        console.log({ order: req.body })
        if (!order) {
            console.log('Недостаточно данных для обновления статуса')

            res.status(400).json({ message: 'Недостаточно данных для обновления статуса' })
            return
        }

        if (newStatus === 'canceled' && order.paymentType === 'external') {
            const payments = (await axiosInstance.post(`/api/order/payments/${order.id}`)).data

            console.log({ payments })
            const paymentCancel = await axiosInstance.post(`/api/order/payments/${order.id}/cancel`, {
                paymentId: payments[0]?.payment_id,
            })
        }

        if (!order.paid_for && order.approve && order.paymentType === 'external') {
            console.log('approve trigger')
            const orderg = (await axiosInstance.post(`/api/order/get`, {
                data: {
                    id: order.id
                }
            })).data.order

            console.log({ orderg })

            // Получаем продукты из order
            const orderIikoProducts = order.iikoProducts;
            const iikoProducts = orderg[0].attributes?.iikoProducts;

            console.log({ iikoProducts })

            // Фильтруем продукты, где stoplist == false в order, а цену берем из orderg
            const iikoProductsApproved = iikoProducts?.filter((item) => {
                // Ищем совпадения между iikoProducts из orderg и order, чтобы применить stoplist
                const matchedProduct = orderIikoProducts.find((orderProduct) =>
                    orderProduct.product === item.product && orderProduct.quantity === item.quantity
                );

                // Фильтруем продукты, где stoplist == false в order
                return matchedProduct && !matchedProduct.stoplist;
            });

            console.log({ iikoProductsApproved })

            // Рассчитываем общую стоимость
            const iikoProductsCost = iikoProductsApproved?.length > 0 ? parseFloat(iikoProductsApproved
                .reduce((acc, item) => acc + (item.price * item.quantity), 0)).toFixed(2)
                : '0';

            console.log({ iikoProductsCost })

            const payments = (await axiosInstance.post(`/api/order/payments/${order.id}`)).data

            console.log({ payments })

            const paymentCapture = await axiosInstance.post(`/api/order/payments/${order.id}/capture`, {
                paymentId: payments[0]?.payment_id,
                amount: {
                    value: iikoProductsCost,
                    currency: "RUB"
                }
            })
        }
        console.log({ newStatus, status })
        const response = await axios.put(`${DEFAULTS.STRAPI.url}/api/orders/${order.id}`,
            {
                data: {
                    status: newStatus,
                    previous_status: status,
                    approve: order.approve,
                    iikoProducts: order.iikoProducts,
                    cancelReason: order.cancelReason,
                },

            },
            {
                headers: {
                    ContentType: 'application/json',
                    Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                }
            },
        )

        const newData = response.data
        // console.log('put res: ', response)
        // const data = await updateServiceOrderStatus(props, status, newStatus);
        res.status(200).json({ newData })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
