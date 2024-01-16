import type { NextApiRequest, NextApiResponse } from 'next'
import { updateServiceOrderStatus } from 'helpers/order/services'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'PUT') {
            res.status(405).json({ message: 'Метод не поддерживается' })
            return;
        }

        const { props, status, newStatus } = req.body
        // console.log(req.body)
        console.log('guest: ', props.orderInfo.customer.guest_account)
        if (!props || !status || !newStatus) {
            res.status(400).json({ message: 'Недостаточно данных для обновления статуса' })
            return;
        }

        const data = await updateServiceOrderStatus(props, status, newStatus);
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
