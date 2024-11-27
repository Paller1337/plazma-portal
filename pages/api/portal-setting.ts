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
        const status = await axios.get(`${DEFAULTS.STRAPI.url}/api/portal-setting`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${STRAPI_API_TOKEN}`
            }
        })
        
        console.log(status.statusText)
        if (!status.data) {
            res.status(204).json({ message: 'Status not found' })
            return
        }

        res.status(200).json({ status: status.data })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '' });
    }
}

