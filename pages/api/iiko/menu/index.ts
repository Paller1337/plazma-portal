import { getIikoMenus } from 'helpers/iiko/menu'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // if (req.method !== 'POST') {
    //     res.setHeader('Allow', ['POST'])
    //     res.status(405).json({ message: 'Method Not Allowed' })
    // }

    try {
        const menus = await getIikoMenus()

        console.log(menus)
        res.status(200).json({ ...menus })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}