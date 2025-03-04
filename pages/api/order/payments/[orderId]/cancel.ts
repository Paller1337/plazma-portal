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
        const { paymentId } = req.body
        console.log({ orderId, paymentId })

        try {

            const findPayment = (await axios.get(DEFAULTS.GENERAL_URL.server + `/api/payments`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
                    },
                    params: {
                        populate: 'deep,2',
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
            console.log({ findPayment })
            const targetPayment = findPayment?.data?.length > 0 ? {
                id: findPayment?.data[0]?.id,
                ...findPayment?.data[0]?.attributes
            } : null

            console.log({ targetPayment })

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

            if (!payload) {
                res.status(400).json({ message: 'Не найден payload для выбранной платежной системы' });
                return
            }


            const checkout = new YooCheckout({
                shopId: payload.shopId,
                secretKey: payload.secretKey,
            })

            console.log({ paymentSystemPayloadData })
            let payment = null
            if (targetPayment.status === 'waiting_for_capture') {
                payment = await checkout.cancelPayment(targetPayment.payment_id).catch(error => { console.error(error) })
            }

            res.status(200).json({ payload, payment, targetPayment });
            return
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка создания платежа' });
        }
    } else {
        res.status(405).json({ error: 'Метод не разрешен' });
    }
}
