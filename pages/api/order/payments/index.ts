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
    if (req.method === 'POST') {
        const { orderId, guestId, amount, phone, description, items, payment_system } = req.body
        // console.log({ orderId, amount, phone, description, items })

        try {
            const paymentSystemPayloadData = (await axios.get(DEFAULTS.GENERAL_URL.server + '/api/payment-system-payloads',
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
                    },
                }
            ))?.data
                .data?.find(ps => ps.id === payment_system)

            const payload = {
                id: paymentSystemPayloadData?.id,
                ...paymentSystemPayloadData?.attributes?.payload
            }
            console.log('find payload: ')
            console.log({ paymentSystemPayload: payload })

            if (!payload) {
                res.status(400).json({ message: 'Не найден payload для выбранной платежной системы' });
                return
            }

            // res.status(200).json({ payload });
            // return
            const checkout = new YooCheckout({
                shopId: payload.shopId,
                secretKey: payload.secretKey,
            })

            const payment = await checkout.createPayment({
                metadata: {
                    orderId,
                    guestId,
                    phone
                },
                amount: {
                    value: amount, // Сумма платежа
                    currency: 'RUB',
                },
                capture: payload.auto_accept_capture, // Автоматическое принятие платежа
                confirmation: {
                    type: 'embedded', // Редирект на страницу оплаты
                    // return_url: `${DEFAULTS.GENERAL_URL.app}/order/${orderId}/success`, // Ссылка после оплаты
                },
                description, // Описание заказа
                receipt: {
                    tax_system_code: 2,
                    customer: {
                        phone
                    },
                    items: items.map((item) => ({
                        description: item.name,
                        quantity: item.quantity,
                        amount: {
                            value: item.price,
                            currency: 'RUB',
                        },
                        vat_code: 1, // Код НДС
                    }))
                },
            })

            if (payment) {
                await axios.post(DEFAULTS.GENERAL_URL.server + '/api/payments',
                    {
                        data: {
                            order: payment.metadata.orderId,
                            payment_system: payload.id,
                            payment_id: payment.id,
                            status: payment.status,
                            metadata: payment.metadata
                        }
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
                        },
                    }
                )
            }
            res.status(200).json({ payment });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка создания платежа' });
        }
    } else {
        res.status(405).json({ error: 'Метод не разрешен' });
    }
}
