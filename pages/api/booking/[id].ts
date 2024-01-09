// pages/api/rooms.ts
import { getBooking } from 'helpers/bnovo/getBooking';
import { getRooms } from 'helpers/bnovo/getRooms';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = parseInt(req.query.id.toString());

    try {
        const rooms = await getBooking(id);
        res.status(200).json({ rooms });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
