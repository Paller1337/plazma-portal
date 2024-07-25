import axios from 'axios';
import { DEFAULTS } from 'defaults';
import { getBooking } from 'helpers/bnovo/getBooking'
import { getRooms } from 'helpers/bnovo/getRooms'
import type { NextApiRequest, NextApiResponse } from 'next'
import { TBookingExtra } from 'types/bnovo'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const categories = await axios.get(`${DEFAULTS.STRAPI.url}/api/categories`, {
            params: {
                'populate': 'deep,3',
            }
        })
        
        res.status(200).json(categories.data)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
