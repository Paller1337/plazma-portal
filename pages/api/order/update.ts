import type { NextApiRequest, NextApiResponse } from 'next'
// import { updateServiceOrderStatus } from 'helpers/order/services'
import axios from 'axios'
import { DEFAULTS } from 'defaults'
import { IOrder, TOrderStatus } from 'types/order'


const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'PUT') {
            res.status(405).json({ message: 'Метод не поддерживается' })
            return;
        }

        const { order, status, newStatus } = req.body.data as { order: IOrder, status: TOrderStatus, newStatus: TOrderStatus }

        console.log(req.body)
        // console.log('order: ', order)
        // console.log('guest: ', order?.guest)
        // console.log('status: ', status)
        // console.log('newStatus: ', newStatus)
        if (!order || !status || !newStatus) {
            console.log('Недостаточно данных для обновления статуса')

            res.status(400).json({ message: 'Недостаточно данных для обновления статуса' })
            return
        }

        const response = await axios.put(`${DEFAULTS.STRAPI.url}/api/orders/${order.id}`,
            {
                data: {
                    status: newStatus,
                    previous_status: status,
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
        // console.log('put res: ', response)
        // const data = await updateServiceOrderStatus(props, status, newStatus);
        res.status(200).json({ newData })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
