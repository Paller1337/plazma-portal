// pages/api/rooms.ts
import { getAllBookings, getBooking } from 'helpers/bnovo/getBooking';
import { getRooms } from 'helpers/bnovo/getRooms';
import { DateTime } from 'luxon';
import type { NextApiRequest, NextApiResponse } from 'next'
import { TBookingExtra } from 'types/bnovo';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const dfrom = DateTime.now().minus({ days: 1 }).toISODate()
    const dto = DateTime.now().plus({ days: 2 }).toISODate()
    
    try {

        const booking = await getAllBookings(dfrom, dto)
        res.status(200).json(booking)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
