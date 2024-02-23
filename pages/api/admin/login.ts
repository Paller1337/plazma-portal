import { authenticationAdminPortal, generateToken } from 'helpers/login'
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        // Отправляем 405 Method Not Allowed, если метод не POST
        res.setHeader('Allow', ['POST'])
        res.status(405).json({ message: 'Method Not Allowed' });
        return;
    }

    const username = req.body.data.username;
    const pass = req.body.data.pass;
    console.log('username ', username)
    console.log('pass ', pass)

    try {
        const data = await authenticationAdminPortal(username, pass);
        console.log('Auth Admin Func Data: ', data)
        const sessionToken = generateToken(
            data.data.id,
            data.data.bnovoBookingId,
            data.data.checkOutDate,
            data.data.role
        )

        console.log({ data, sessionToken })
        res.status(200).json({ data, sessionToken });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
