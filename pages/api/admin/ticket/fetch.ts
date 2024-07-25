import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { DEFAULTS } from 'defaults'
import { axiosInstance } from 'helpers/axiosInstance'

const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        // Отправляем 405 Method Not Allowed, если метод не POST
        res.setHeader('Allow', ['POST'])
        res.status(405).json({ message: 'Method Not Allowed' })
        return
    }

    try {
        const tickets = await axios.get(`${DEFAULTS.STRAPI.url}/api/support-tickets`,
            {
                params: {
                    sort: {
                        create_at: `desc`,
                    },
                    populate: 'deep,4',
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${STRAPI_API_TOKEN}`
                }
            })

        if (!tickets.data) {
            res.status(204).json({ message: 'Tickets not found' })
            return
        }

        res.status(200).json({ tickets: tickets.data })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

