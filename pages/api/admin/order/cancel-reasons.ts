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

        const reasons = (await axios.get(`${DEFAULTS.STRAPI.url}/api/cancel-reasons`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${STRAPI_API_TOKEN}`
                }
            }))?.data

        if (!reasons) {
            res.status(204).json({ message: 'Reasons not found' })
            return
        }
        const data = reasons?.data?.map(r => ({
            id: r.id,
            ...r.attributes
        }))

        res.status(200).json(data)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

