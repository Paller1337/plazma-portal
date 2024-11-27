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
    const { id, password } = req.body.data
    // console.log('phone ', phone)

    try {
        const response = await axios.post(`${DEFAULTS.STRAPI.url}/api/admin/login`, { id, password },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${STRAPI_API_TOKEN}`
                }
            })
            .catch(e => e)

        const resGuest = await axios.get(`${DEFAULTS.STRAPI.url}/api/guests`, {
            params: {
                filters: {
                    id: {
                        '[$eq]': id
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
        })
        const guest = resGuest.data.data.length > 0 ? resGuest.data.data[0] : null

        if (response.status === 200) {
            res.status(200).json({ token: response.data.token, guest })
        } else if (response.status === 401) {
            res.status(401).json({ message: 'Неверный пароль' })
        } else {
            res.status(204).json({ message: 'Администратор не найден' })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}
