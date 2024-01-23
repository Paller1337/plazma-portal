// pages/api/rooms.ts
import axios from 'axios'
import { DEFAULTS } from 'defaults'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const faqs = await axios.get(`${DEFAULTS.STRAPI.url}/api/faqs`, {
            params: {
                'populate': 'deep,4',
            }
        })
        
        res.status(200).json(faqs.data)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
