import { getIikoMenuById, getIikoMenus } from 'helpers/iiko/menu'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // if (req.method !== 'POST') {
    //     res.setHeader('Allow', ['POST'])
    //     res.status(405).json({ message: 'Method Not Allowed' })
    // }
    const { id } = req.query

    try {
        const menu = await getIikoMenuById(id as string)

        console.log(menu)
        res.status(200).json({ ...menu })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}