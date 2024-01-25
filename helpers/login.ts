import { TBookingExtra } from 'types/bnovo'
import { getBooking, getBookingByRoomId, getBookingCustomers } from './bnovo/getBooking'
import { axiosInstance } from './axiosInstance'
import { createGuestAccount, getGuestAccountByRoomIdAndSurname } from './session/guestAccount'
import jwt, { JwtPayload } from 'jsonwebtoken'
import Cookies from 'js-cookie'
import { IGuestAccountResident } from 'types/session'
import { DateTime } from 'luxon'
import axios from 'axios'
import { updateGuestAccountStatus } from './guest/guest'



export const SECRET_KEY = process.env.JWT_KEY

export const generateToken = (accountId, bnovoBookingId, checkOutDate, role) => {
    const payload = {
        accountId,
        bnovoBookingId,
        checkOutDate,
        role,
        isExpired: false
    }
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1d' })
    return token
}

export const verifyToken = (token) => {
    // const token = Cookies.get('session_token')
    console.log('verifieng token: ', token)
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

export const decodeToken = (token) => {
    // const token = Cookies.get('session_token')
    console.log('verifyToken: ', token)
    if (!token) return {} as JwtPayload
    try {
        const decoded = jwt.verify(token, SECRET_KEY)
        return decoded as JwtPayload

    } catch (error) {
        console.error('Ошибка при декодировании токена:', error);
        return {
            isExpired: true
        } as JwtPayload
    }
}

export default async function authenticationPortal(surname: string, roomId: string, token?: string) {
    const nowDate = DateTime.now()
    console.log(SECRET_KEY)
    if (!SECRET_KEY) return { status: false, message: 'Нет ключа SECRET_KEY' }
    const isToken = verifyToken(token)
    if (isToken) return { status: true, message: 'Вы уже авторизованы', data: {} }

    const strapiResponse = await getGuestAccountByRoomIdAndSurname(roomId, surname)
    if (strapiResponse) {
        console.log('Strapi Res: ', strapiResponse)
        if (strapiResponse.attributes.status === 'expired') {
            console.log('Аккаунт неактивен Strapi')
            return { status: false, message: 'Аккаунт больше не активен', data: {} }
        }


        if (nowDate > DateTime.fromISO(strapiResponse.attributes.checkOutDate)) {
            const bookingId = strapiResponse.attributes.bnovoBookingId
            const bookingInfo = await axiosInstance.get(`/api/booking/${bookingId}`)
            // TODO актуализация времени бронирования
            console.log('Аккаунт неактивен после проверки в bnovo')

            if (bookingInfo.data.status_id == '4') {
                const updateRes = await updateGuestAccountStatus(strapiResponse.id, 'expired')

                console.log('Аккаунт деактивирован')
                return { status: false, message: 'Аккаунт больше не активен', data: {} }
            }
        }

        const role = 'guest'
        // const sessionToken = generateToken(
        //     strapiResponse.id,
        //     strapiResponse.attributes.bnovoBookingId,
        //     strapiResponse.attributes.checkOutDate,
        //     role
        // )
        // Cookies.set('session_token', sessionToken)

        return {
            status: true, message: 'С возвращением!', data: {
                id: strapiResponse.id,
                bnovoBookingId: strapiResponse.attributes.bnovoBookingId,
                checkOutDate: strapiResponse.attributes.checkOutDate,
                role: role
            }
        }
    }

    const bnovoResponse = await axiosInstance(`/api/booking-room/${roomId}`)
    if (!bnovoResponse.data?.status) {
        return { status: true, message: 'Бронирования не существует.', data: {} }
    }

    const data = bnovoResponse.data.data as TBookingExtra

    if (bnovoResponse.status) {
        const nowDate = DateTime.now().toISO()
        const isBefore = new Date(data.departure) < new Date(nowDate)

        if (isBefore) return { status: false, message: 'Бронирование уже не актуально', data: {} }


        const customers = getBookingCustomers(data);

        // console.log('surname: ', surname)
        const customer = (await customers).find(
            x => x.surname.toLocaleLowerCase() === surname.toLocaleLowerCase()
        )
        // console.log('customer: ', customer)
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
            // const sessionToken = generateToken(createdAccountId, data.id, data.departure, role)
            // Cookies.set('session_token', sessionToken)

            return {
                status: true, message: 'Добро пожаловать!', data: {
                    id: createdAccountId,
                    bnovoBookingId: data.id,
                    checkOutDate: data.departure,
                    role: role
                }
            }
        }
        return { status: false, message: 'Нет жильцов. ', data: {} }
    }
}

