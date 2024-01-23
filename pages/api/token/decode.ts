import { decodeToken } from 'helpers/login';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST'])
        res.status(405).json({ message: 'Method Not Allowed' });
        return;
    }

    const token = req.body.token;
    console.log('token ', token)

    try {
        if (token) {
            const data = decodeToken(token)
            if (data) {
                res.status(200).json(data);
            } else {
                res.status(204).json(null)
            }
        } else {
            res.status(400).json('Token not found')
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
