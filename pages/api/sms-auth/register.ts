import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { DEFAULTS } from 'defaults'

const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST'])
        res.status(405).json({ message: 'Method Not Allowed' })
        return
    }

    const { phone, name, email, role, isSubscribe } = req.body.data;

    try {
        const isGuest = await axios.get(`${DEFAULTS.STRAPI.url}/api/guests/`, {
            params: {
                filters: {
                    phone: {
                        $eq: phone,
                    },
                },
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${STRAPI_API_TOKEN}`
            }
        })
        if (isGuest.data && isGuest.data.data.length > 0) {
            console.log('Гость уже зарегистрирован')
            return res.status(200).json(isGuest.data)
        }
        // else {
        //     console.log('Гости не найдены');
        //     return null;
        // }
        const response = await axios.post(`${DEFAULTS.STRAPI.url}/api/guests`, {
            data: {
                phone,
                name,
                email,
                role,
                approved: true,
                mailing: isSubscribe ? isSubscribe : false
            }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${STRAPI_API_TOKEN}`
            }
        });
        console.log(response.data)
        res.status(201).json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}
