import axios from 'axios'
import { DEFAULTS } from 'defaults'
import type { NextApiRequest, NextApiResponse } from 'next'


const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        // Отправляем 405 Method Not Allowed, если метод не POST
        res.setHeader('Allow', ['POST'])
        res.status(405).json({ message: 'Method Not Allowed' });
        return
    }

    console.log('subscribe api: ', req.body)
    const subscription = req.body.subscription
    const visitorId = req.body.visitorId

    try {
        const subscribe = await axios.post(DEFAULTS.STRAPI.url + '/api/subscription/subscribe', {
            subscription,
            visitorId
        }, {
            headers: {
                ContentType: 'application/json',
                Authorization: `Bearer ${STRAPI_API_TOKEN}`,
            }
        })

        res.status(200).json(subscribe.data)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
