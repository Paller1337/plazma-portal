import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { DEFAULTS } from 'defaults'
import { axiosInstance } from 'helpers/axiosInstance'
import { DateTime } from 'luxon';

const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        // Отправляем 405 Method Not Allowed, если метод не POST
        res.setHeader('Allow', ['POST'])
        res.status(405).json({ message: 'Method Not Allowed' })
        return
    }

    try {
        const now = DateTime.now().toISO()
        const oneWeekAgo = DateTime.now().minus({ days: 7 }).toISO()

        const orders = await axios.get(`${DEFAULTS.STRAPI.url}/api/orders`,
            {
                // params: {
                //     sort: {
                //         create_at: `desc`,
                //     },
                //     populate: 'deep,4',
                // },
                params: {
                    filters: {
                        createdAt: {
                            $gte: oneWeekAgo, // Дата больше или равна 7 дней назад
                            $lte: now,        // Дата меньше или равна текущей
                        },
                    },
                    sort: {
                        createdAt: 'desc', // Сортировка по убыванию
                    },
                    populate: 'deep,4',
                    pagination: {
                        limit: 200, // Максимум 500 записей
                    },
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${STRAPI_API_TOKEN}`
                }
            })

        if (!orders.data) {
            res.status(204).json({ message: 'Orders not found' })
            return
        }

        res.status(200).json({ orders: orders.data })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

