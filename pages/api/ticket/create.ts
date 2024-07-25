import axios from 'axios'
import { DEFAULTS } from 'defaults';


const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const ticketData = req.body
        console.log(ticketData)
        try {
            // Отправляем запрос на создание заказа в Strapi
            const response = await axios.post(`${DEFAULTS.STRAPI.url}/api/support-tickets`,
                { data: ticketData },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
                    },
                }
            );

            // Возвращаем ответ с сервера Strapi
            res.status(200).json(response.data)
        } catch (error) {
            console.error('Error creating order:', error);
            res.status(500).json({ error: 'Error creating order' });
        }
    } else {
        // Обрабатываем только POST-запросы
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
