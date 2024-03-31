import { getIikoOrganization } from 'helpers/iiko/organizatoins'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST'])
        res.status(405).json({ message: 'Method Not Allowed' })
    }

    try {
        const orgRes = await getIikoOrganization()

        console.log(orgRes)
        res.status(200).json({ ...orgRes })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}