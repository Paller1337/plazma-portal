import axios from 'axios';
import { DEFAULTS } from 'defaults';
import { getBooking } from 'helpers/bnovo/getBooking';
import { getRooms } from 'helpers/bnovo/getRooms';
import type { NextApiRequest, NextApiResponse } from 'next'
import { TBookingExtra } from 'types/bnovo';

const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = parseInt(req.query.id.toString())

    try {
        const guest = await axios.get(`${DEFAULTS.STRAPI.url}/api/guest-accounts/${id}`, {
            params: {
                'populate': 'deep,3',
            },
            headers: {
                ContentType: 'application/json',
                Authorization: `Bearer ${STRAPI_API_TOKEN}`,
            }
        })
        
        res.status(200).json(guest.data)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
