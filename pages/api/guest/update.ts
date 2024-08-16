import type { NextApiRequest, NextApiResponse } from 'next'
import { updateServiceOrderStatus } from 'helpers/order/services'
import { updateSupportTicketStatus } from 'helpers/support/tickets'
import axios from 'axios'
import { DEFAULTS } from 'defaults'
import { IGuestAccount } from 'types/session'


const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'PUT') {
            res.status(405).json({ message: 'Метод не поддерживается' })
            return;
        }

        const { id, approved } = req.body.data as { id: number; approved: boolean }

        console.log(req.body)
        // console.log('order: ', order)
        // console.log('guest: ', order?.guest)
        // console.log('status: ', status)
        // console.log('newStatus: ', newStatus)
        if (typeof approved !== 'boolean' || !id) {
            console.log('Недостаточно данных для обновления статуса')
            res.status(400).json({ message: 'Недостаточно данных для обновления статуса' })
            return
        }

        const response = await axios.put(`${DEFAULTS.STRAPI.url}/api/guests/${id}`,
            {
                data: {
                    approved: approved,
                },

            },
            {
                headers: {
                    ContentType: 'application/json',
                    Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                }
            },
        )

        const newData = response.data

        res.status(200).json({ newData })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
