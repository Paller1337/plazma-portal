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
        const { deep } = req.body

        try {

            const findPayments = (await axios.get(DEFAULTS.GENERAL_URL.server + `/api/payments`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
                    },
                    params: {
                        populate: deep ? 'deep,2' : 'deep,1',
                        sort: 'createdAt:DESC',
                        filters: {
                            order: {
                                id: {
                                    $eq: orderId
                                }
                            }
                        }
                    }
                }
            ))?.data
            console.log({ paymentsData: findPayments.data })
            const payments = findPayments?.data?.length > 0 ? findPayments?.data?.map(p => {
                // console.log(p)
                return ({
                    id: p?.id,
                    ...p?.attributes
                })
            }) : null

            res.status(200).json(payments)
            return

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка при получении информации о платеже' });
        }
    } else {
        res.status(405).json({ error: 'Метод не разрешен' });
    }
}
