import { getRooms } from 'helpers/bnovo/getRooms';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        console.log('[API Rooms]')
        const rooms = await getRooms();
        // console.log('[API Rooms]')
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
