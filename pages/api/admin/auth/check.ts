import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { DEFAULTS } from 'defaults'
import { generateToken, verifyToken } from 'helpers/login'
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        // Отправляем 405 Method Not Allowed, если метод не POST
        res.setHeader('Allow', ['POST'])
        res.status(405).json({ message: 'Method Not Allowed' })
        return
    }

    res.setHeader('Access-Control-Allow-Origin', 'https://portal-plazma.ru.tuna.am')
    const phone = req.body.data.phone
    // console.log('phone ', phone)

    try {
        const response = await axios.get(`${DEFAULTS.STRAPI.url}/api/guests`, {
            params: {
                filters: {
                    phone: {
                        '[$eq]': phone
                    },
                    role: {
                        // '[$eq]': 'admin',
                        $notIn: ['user']
                    }
                }
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${STRAPI_API_TOKEN}`
            }
        });

        const guest = response.data.data.length > 0 ? response.data.data[0] : null

        if (!guest) {
            res.status(204).json({ message: 'Администратор не найден' })
            return
        }

        const adminRes = await axios.post(`${DEFAULTS.STRAPI.url}/api/admin/isfirstlogin`, { id: guest.id }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${STRAPI_API_TOKEN}`
            }
        });
        res.status(200).json({ admin: adminRes.data, guest: { id: guest.id, status: guest ? true : false } })

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}
