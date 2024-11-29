import { YooCheckout } from '@a2seven/yoo-checkout'
import axios from 'axios';
import { DEFAULTS } from 'defaults';
import { axiosInstance } from 'helpers/axiosInstance';

const checkout = new YooCheckout({
    shopId: '499489',
    secretKey: 'test_EseOkYl7mFGASpLlS2ABreyRYemq78NV96uImawIclw',
})

const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const data = {
            orderId: '',
            amount: 2,
            phone: "+79539687367",
            description: 'Оплата заказа',
            items: [
                {
                    name: 'Товар из корзины',
                    quantity: 1,
                    price: 1
                },
                {
                    name: 'Товар из корзины',
                    quantity: 1,
                    price: 1
                }
            ]
        }

        const { orderId, guestId, amount, phone, description, items } = req.body;
        console.log({ orderId, amount, phone, description, items })
        try {
            const payment = await checkout.createPayment({
                metadata: {
                    orderId,
                    guestId,
                    phone
                },
                amount: {
                    value: amount, // Сумма платежа
                    currency: 'RUB', // Валюта
                },
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
            });
            console.log({ payment })

            if (payment) {
                const paymentSystem = (await axios.get(DEFAULTS.GENERAL_URL.server + '/api/payment-systems',
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
                        },
                    }
                ))?.data
                    .data?.find(ps => ps.attributes.name === 'yookassa')
                // console.log({ paymentSystem })
                await axios.post(DEFAULTS.GENERAL_URL.server + '/api/payments',
                    {
                        data: {
                            order: payment.metadata.orderId,
                            payment_system: paymentSystem.id,
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
            // res.status(200).json({ orderId, amount, phone, description, items });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка создания платежа' });
        }
    } else {
        res.status(405).json({ error: 'Метод не разрешен' });
    }
}
