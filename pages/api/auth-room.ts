import { axiosInstance } from 'helpers/axiosInstance';
import { getBookingCustomers } from 'helpers/bnovo/getBooking';
import authenticationPortal, { generateToken } from 'helpers/login';
import { NextApiRequest, NextApiResponse } from 'next';
import { TBookingExtra } from 'types/bnovo';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        // Отправляем 405 Method Not Allowed, если метод не POST
        res.setHeader('Allow', ['POST'])
        res.status(405).json({ message: 'Method Not Allowed' });
        return;
    }

    const name = req.body.data.name
    const surname = req.body.data.surname
    const roomId = req.body.data.roomId
    console.log('surname ', surname)
    console.log('roomNumber ', roomId)

    try {
        const bnovoResponse = await axiosInstance(`/api/booking-room/${roomId}`)
        const bookingData = bnovoResponse.data.data as TBookingExtra
        const customers = getBookingCustomers(bookingData)

        const customer = customers.find(x => (
            (x.name.toLocaleLowerCase() === name.toLocaleLowerCase()
                && (x.surname.toLocaleLowerCase() === surname.toLocaleLowerCase()))))

        if (customer) {
            res.status(200).json({ customer })
        } else {
            res.status(404).json({ message: 'Гость не найден' })
        }
            
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
