// pages/api/authenticate.ts
import type { NextApiRequest, NextApiResponse } from 'next'
// import { findOrCreateUserInStrapi, updateUserExpiry } from '../../api/strapi'
import verifyBnovoBooking from 'helpers/bnovo/verifyBooking';
import { getBookingByRoomId } from 'helpers/bnovo/getBooking';
import { axiosInstance } from 'helpers/axiosInstance';
import { createServiceOrder } from 'helpers/order/services';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const roomId = 826385
    // const surname = req.body.surname

    try {
        const res = await createServiceOrder()
        console.log('createServiceOrder: ', res)


        res.status(200).json(res)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
