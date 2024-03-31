import getIikoToken from 'helpers/iiko/auth'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST'])
        res.status(405).json({ message: 'Method Not Allowed' })
    }

    try {
        const authRes = await getIikoToken()

        console.log(authRes)
        res.status(200).json({ authRes })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}