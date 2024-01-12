// pages/api/rooms.ts
import { getBooking, getBookingByRoomId } from 'helpers/bnovo/getBooking';
import { getRooms } from 'helpers/bnovo/getRooms';
import type { NextApiRequest, NextApiResponse } from 'next'
import { TBookingExtra } from 'types/bnovo';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = parseInt(req.query.id.toString())

    try {
        const booking = await getBookingByRoomId(id)
        res.status(200).json(booking)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
