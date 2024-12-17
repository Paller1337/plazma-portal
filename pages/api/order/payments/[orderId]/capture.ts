import { YooCheckout } from '@a2seven/yoo-checkout'
import axios from 'axios';
import { DEFAULTS } from 'defaults';
import { axiosInstance } from 'helpers/axiosInstance';

// const checkout = new YooCheckout({
//     shopId: '497828',
//     secretKey: 'live_WAGecp73V3188OHjZPfM7wJFRMxslBFj-MOY6g4_o9A',
// })



const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN

export default async function handler(req, res) {
    const { orderId } = req.query;
    if (req.method === 'POST') {
        const { amount, paymentId } = req.body
        console.log({ orderId, amount, paymentId })

        try {
            const findPayments = (await axios.get(DEFAULTS.GENERAL_URL.server + `/api/payments`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
                    },
                    params: {
                        populate: 'deep,2',
                        sort: 'createdAt:DESC',
                        filters: {
                            order: {
                                id: {
                                    $eq: orderId
                                }
                            },
                            payment_id: {
                                $eq: paymentId
                            }
                        }
                    }
                }
            ))?.data

            console.log({ paymentsData: findPayments })
            const payments = findPayments?.data?.length > 0 ? findPayments?.data?.map(p => {
                // console.log(p)
                return ({
                    id: p?.id,
                    ...p?.attributes
                })
            }) : null
            console.log({ payments })
            const targetPayment = payments?.length > 0 ? payments[0] : null

            if (!targetPayment?.payment_id) {
                res.status(400).json({ message: 'Не найден id для платежа' });
                return
            }

            const paymentSystemPayloadData = (await axios.get(DEFAULTS.GENERAL_URL.server + '/api/payment-system-payloads',
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
                    },
                }
            ))?.data
                .data?.find(ps => ps.id === targetPayment?.payment_system?.data?.id)

            console.log({ paymentSystemPayloadData })

            const payload = {
                id: paymentSystemPayloadData?.id,
                ...paymentSystemPayloadData?.attributes?.payload
            }


            // console.log({ targetPayment, payload })
            // res.status(400).json({ targetPayment, payload });
            // return

            // res.status(200).json({ targetPayment, payload });
            // return

            // console.log('find payload: ')
            // console.log({ paymentSystemPayload: payload })

            if (!payload) {
                res.status(400).json({ message: 'Не найден payload для выбранной платежной системы' });
                return
            }


            const checkout = new YooCheckout({
                shopId: payload.shopId,
                secretKey: payload.secretKey,
            })

            const payment = await checkout.capturePayment(targetPayment.payment_id, {
                amount
            })

            const updateOrder = await axios.put(`${DEFAULTS.STRAPI.url}/api/orders/${orderId}`,
                {
                    data: {
                        paid_for: true,
                    },

                },
                {
                    headers: {
                        ContentType: 'application/json',
                        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                    }
                },
            )


            res.status(200).json({ payload, payment, targetPayment });
            return

            //Обновление статуса платежа
            // if (payment) {
            //     await axios.post(DEFAULTS.GENERAL_URL.server + '/api/payments',
            //         {
            //             data: {
            //                 order: payment.metadata.orderId,
            //                 payment_system: payload.id,
            //                 payment_id: payment.id,
            //                 status: payment.status,
            //                 metadata: payment.metadata
            //             }
            //         },
            //         {
            //             headers: {
            //                 'Content-Type': 'application/json',
            //                 'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
            //             },
            //         }
            //     )
            // }
            // res.status(200).json({ payment });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка создания платежа' });
        }
    } else {
        res.status(405).json({ error: 'Метод не разрешен' });
    }
}
