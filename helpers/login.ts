import { TBookingExtra } from 'types/bnovo'
import { getBookingByRoomId, getBookingCustomers } from './bnovo/getBooking'
import { axiosInstance } from './axiosInstance'
import { createGuestAccount, getGuestAccountByRoomIdAndSurname } from './session/guestAccount'
import jwt, { JwtPayload } from 'jsonwebtoken'
import Cookies from 'js-cookie'



const SECRET_KEY = 'PlazmaHotel1337PorTaL'

const generateToken = (bnovoBookingId, checkOutDate) => {
    const payload = {
        bnovoBookingId,
        checkOutDate
    }
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1d' })
    return token
}

export const verifyToken = () => {
    const token = Cookies.get('session_token')
    console.log('verifyToken: ', token)
    if (!token) return false
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const currentDate = new Date()
        const checkOutDate = new Date((decoded as JwtPayload).checkOutDate)

        return currentDate <= checkOutDate;
    } catch (error) {
        console.error('Ошибка при верификации токена:', error);
        return false;
    }
}

export default async function authenticationPortal(surname: string, roomId: string) {
    const strapiResponse = await getGuestAccountByRoomIdAndSurname(roomId, surname)
    // console.log('strapiResponse ', strapiResponse)

    const isToken = verifyToken()
    if (isToken) return { status: true, message: 'Вы уже авторизованы' }

    if (strapiResponse) {
        const sessionToken = generateToken(strapiResponse.attributes.bnovoBookingId, strapiResponse.attributes.checkOutDate)
        Cookies.set('session_token', sessionToken)

        return { status: true, message: 'Аккаунт найден. Авторизация успешна!' }
    }

    const bnovoResponse = await axiosInstance(`/api/booking-room/${roomId}`)
    if (!bnovoResponse.data?.status) {
        return { status: true, message: 'Бронирования не существует.' }
    }

    const data = bnovoResponse.data.data as TBookingExtra

    if (bnovoResponse.status) {
        const customers = getBookingCustomers(data);
        const customer = (await customers).find(
            x => x.surname.toLocaleLowerCase() === surname.toLocaleLowerCase()
        )

        if (customer) {
            // console.log(`Имя: ${customer.name} \nФамилия: ${customer.surname} \nID комнаты: ${data.actual_price?.room_id} \nДата заезда: ${data.arrival} \nДата выезда: ${data.departure} \n`)
            const resCreateAccount = await createGuestAccount(
                {
                    firstName: customer.name,
                    lastName: customer.surname,
                    roomId: parseInt(data.actual_price?.room_id).toString(),
                    checkInDate: data.arrival,
                    checkOutDate: data.departure,
                    bnovoBookingId: data.id
                }
            )
            console.log('Create Account: ', resCreateAccount)

            const sessionToken = generateToken(data.id, data.departure)
            Cookies.set('session_token', sessionToken)

            return { status: true, message: 'Сессия проживания создана. Авторизация успешна.' }
        }
        return { status: false, message: 'Нет жильцов. ' }
    }
}

