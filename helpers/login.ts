import { TBookingExtra } from 'types/bnovo'
import { getBookingByRoomId, getBookingCustomers } from './bnovo/getBooking'
import { axiosInstance } from './axiosInstance'
import { createGuestAccount, getGuestAccountByRoomIdAndSurname } from './session/guestAccount'
import jwt, { JwtPayload } from 'jsonwebtoken'
import Cookies from 'js-cookie'
import { IGuestAccountResident } from 'types/session'
import { DateTime } from 'luxon'



const SECRET_KEY = 'PlazmaHotel1337PorTaL'

const generateToken = (accountId, bnovoBookingId, checkOutDate, role) => {
    const payload = {
        accountId,
        bnovoBookingId,
        checkOutDate,
        role
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

export const decodeToken = () => {
    const token = Cookies.get('session_token')
    console.log('verifyToken: ', token)
    if (!token) return {} as JwtPayload
    try {
        const decoded = jwt.verify(token, SECRET_KEY)
        return decoded as JwtPayload

    } catch (error) {
        console.error('Ошибка при верификации токена:', error);
        return {} as JwtPayload;
    }
}

export default async function authenticationPortal(surname: string, roomId: string) {
    const strapiResponse = await getGuestAccountByRoomIdAndSurname(roomId, surname)
    // console.log('strapiResponse ', strapiResponse)

    const isToken = verifyToken()
    if (isToken) return { status: true, message: 'Вы уже авторизованы' }

    if (strapiResponse) {
        const role = 'guest'
        const sessionToken = generateToken(strapiResponse.id, strapiResponse.attributes.bnovoBookingId, strapiResponse.attributes.checkOutDate, role)
        Cookies.set('session_token', sessionToken)

        return { status: true, message: 'Аккаунт найден. Авторизация успешна!' }
    }

    const bnovoResponse = await axiosInstance(`/api/booking-room/${roomId}`)
    // console.log('bnovoResponse: ', bnovoResponse)
    if (!bnovoResponse.data?.status) {
        return { status: true, message: 'Бронирования не существует.' }
    }

    const data = bnovoResponse.data.data as TBookingExtra

    if (bnovoResponse.status) {
        const nowDate = DateTime.now().toISO()
        const isBefore = new Date(data.departure) < new Date(nowDate)

        if (isBefore) return { status: false, message: 'Бронирование уже не актуально' }


        const customers = getBookingCustomers(data);
        const customer = (await customers).find(
            x => x.surname.toLocaleLowerCase() === surname.toLocaleLowerCase()
        )

        if (customer) {
            // console.log(`Имя: ${customer.name} \nФамилия: ${customer.surname} \nID комнаты: ${data.actual_price?.room_id} \nДата заезда: ${data.arrival} \nДата выезда: ${data.departure} \n`)
            const residents: IGuestAccountResident[] = data.customers.map((x => (
                {
                    name: x.name,
                    surname: x.surname,
                    middlename: x.extra.middlename,
                    birthdate: x.birthdate,
                    email: x.email,
                    phone: x.phone,
                } as IGuestAccountResident
            )))

            const resCreateAccount = await createGuestAccount(
                {
                    firstName: customer.name,
                    lastName: customer.surname,
                    roomId: parseInt(data.actual_price?.room_id).toString(),
                    checkInDate: data.arrival,
                    checkOutDate: data.departure,
                    bnovoBookingId: data.id,
                    phone: data.customer.phone,
                    email: data.customer.email,
                    residents: residents,
                }
            )
            // console.log('Create Account: ', resCreateAccount)

            const role = 'guest'
            const createdAccountId = resCreateAccount.data.id
            const sessionToken = generateToken(createdAccountId, data.id, data.departure, role)
            Cookies.set('session_token', sessionToken)

            return { status: true, message: 'Сессия проживания создана. Авторизация успешна.' }
        }
        return { status: false, message: 'Нет жильцов. ' }
    }
}

