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
        const response = await axios.post(`${DEFAULTS.STRAPI.url}/api/admin/register`, { id, password },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${STRAPI_API_TOKEN}`
                }
            });
        console.log('admin data: ', response.data)
        // const guest = response

        if (response.status === 200) {
            res.status(200).json(response.data)
        } else {
            res.status(204).json({ message: 'Администратор не найден' })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}
