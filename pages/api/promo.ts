import axios from 'axios';
import { DEFAULTS } from 'defaults';
import { getBooking } from 'helpers/bnovo/getBooking'
import { getRooms } from 'helpers/bnovo/getRooms'
import type { NextApiRequest, NextApiResponse } from 'next'
import { TBookingExtra } from 'types/bnovo'


const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('url: ', DEFAULTS.STRAPI.url)
    console.log('token: ', STRAPI_API_TOKEN)
    try {
        const promotion = await axios.get(`${DEFAULTS.STRAPI.url}/api/promotions`, {
            params: {
                'populate': 'deep,3',
            },
            headers: {
                ContentType: 'application/json',
                Authorization: `Bearer ${STRAPI_API_TOKEN}`,
            }
        })

        const promo = {
            id: promotion.data.data[0]?.id,
            title: promotion.data.data[0]?.attributes?.title,
            subtitle: promotion.data.data[0]?.attributes?.subtitle,
            tag: promotion.data.data[0]?.attributes?.tag,
            href: promotion.data.data[0]?.attributes?.href,
            image: promotion.data.data[0]?.attributes?.image.data?.attributes?.url,
        }

        console.log('cat api: ', promo)


        res.status(200).json(promo)
    } catch (error) {
        console.error('Ошибка API статей:', error)
        res.status(500).json({ message: error.message });
    }
}