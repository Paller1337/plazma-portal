// pages/api/authenticate.ts
import type { NextApiRequest, NextApiResponse } from 'next'
// import { findOrCreateUserInStrapi, updateUserExpiry } from '../../api/strapi'
import verifyBnovoBooking from 'helpers/bnovo/verifyBooking';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { surname, roomNumber } = req.body;
        const bookings = await verifyBnovoBooking(surname, roomNumber);

        if (bookings) {
            //   let user = await findOrCreateUserInStrapi(booking);
            //   user = await updateUserExpiry(user, booking.endDate);

            // Отправьте данные пользователя и токен сессии обратно на frontend
            res.status(200).json({ bookings: bookings })
            //   res.status(200).json({ user, token: /* сгенерировать токен */ });
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
