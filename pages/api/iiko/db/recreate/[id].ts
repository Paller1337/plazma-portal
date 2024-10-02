import { NextApiRequest, NextApiResponse } from 'next'
import prisma from 'prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query

    if (typeof id !== 'string' || !id.trim()) {
        return res.status(400).json({ error: 'Invalid banquet ID' })
    }

    const banquetId = id
    try {
        switch (req.method) {
            case 'PATCH':
                // Редактирование банкета
                const updatedBanquet = await prisma.banquet.update({
                    where: {
                        id: banquetId
                    },
                    data: {
                        status: 'not_sent'
                    }
                })

                if (!updatedBanquet) {
                    return res.status(404).json({ error: 'Banquet not found' })
                }

                return res.status(204).json(updatedBanquet);

            default:
                return res.status(405).end();
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
}
