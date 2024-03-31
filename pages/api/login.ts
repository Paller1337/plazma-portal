import authenticationPortal, { generateToken } from 'helpers/login';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        // Отправляем 405 Method Not Allowed, если метод не POST
        res.setHeader('Allow', ['POST'])
        res.status(405).json({ message: 'Method Not Allowed' });
        return;
    }

    const surname = req.body.data.surname;
    const roomNumber = req.body.data.roomNumber;
    console.log('surname ', surname)
    console.log('roomNumber ', roomNumber)

    try {
        const data = await authenticationPortal(surname, roomNumber);
        console.log('Auth Func Data: ', data)
        if (!data.data) return
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
