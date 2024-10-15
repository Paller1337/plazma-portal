import getIikoToken from 'helpers/iiko/auth'
import { getBanquetInWork } from 'helpers/iiko/getBanquetsInWork'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST'])
        res.status(405).json({ message: 'Method Not Allowed' })
    }

    try {
        const banquets = await getBanquetInWork()

        res.status(200).json({ banquets })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}