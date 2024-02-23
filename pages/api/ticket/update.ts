import type { NextApiRequest, NextApiResponse } from 'next'
import { updateServiceOrderStatus } from 'helpers/order/services'
import { updateSupportTicketStatus } from 'helpers/support/tickets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== 'PUT') {
            res.status(405).json({ message: 'Метод не поддерживается' })
            return;
        }

        console.log(req.body)

        const { props, status, newStatus } = req.body
        if (!props || !status || !newStatus) {
            res.status(400).json({ message: 'Недостаточно данных для обновления статуса' })
            return;
        }

        const data = await updateSupportTicketStatus(props, status, newStatus);
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
