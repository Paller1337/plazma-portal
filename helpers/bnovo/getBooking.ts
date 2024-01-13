import { TBooking, TBookingExtra } from 'types/bnovo';
import { bnovoAuth } from './auth'
import bnovoClient from './bnovoClient'
import { DateTime } from 'luxon'
import axios from 'axios';
import { axiosInstance } from 'helpers/axiosInstance';

export async function getBooking(id: number) {
    await bnovoAuth() // Убедитесь, что мы авторизованы

    try {
        const response = await bnovoClient.post(`https://online.bnovo.ru/booking/general/${id}`, {
            // Параметры запроса, если они нужны
        });

        return response.data;
    } catch (error) {
        console.error('Ошибка при получении списка комнат:', error);
        throw error;
    }
}

export async function getBookingByRoomId(id: number) {
    // await bnovoAuth() 

    const today = DateTime.now().toISODate()
    const bookings = await getAllBookings(today, today)
    if (!bookings) return { status: false, message: 'Бронирований нет', data: '' }

    const bookingWithNeededRoom = bookings.filter(booking => booking.room_id === id.toString() && booking.status_id !== 4);
    // status_id: 1 - Новое
    // status_id: 3 - Заселен
    // status_id: 4 - Выехал
    // status_id: 5 - Проверено
    console.log('ID бронирования по номеру комнаты: ', bookingWithNeededRoom)
    console.log('NODE_ENV: ', process.env.NODE_ENV)
    try {
        if (bookingWithNeededRoom) {
            const response = await axiosInstance(`/api/booking/${bookingWithNeededRoom[0].booking_id}`, {
                // Параметры запроса, если они нужны
            })

            return { status: true, message: 'Бронирование найдено', data: response.data as TBookingExtra }
        } else {
            return { status: false, message: 'Бронирование не найдено', data: '' }
        }
    } catch (error) {
        console.error('Ошибка при получении списка комнат:', error);
        throw error;
    }
}

export async function getAllBookings(dfrom: string, dto: string) {
    await bnovoAuth()

    try {
        const response = await bnovoClient.post('https://online.bnovo.ru/planning/bookings', {
            dfrom: dfrom,
            dto: dto,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        const bookings = await response.data.result as TBooking[]
        return bookings
    } catch (error) {
        console.error('Ошибка при проверке бронирования через Bnovo:', error);
        throw error;
    }
}


export function getBookingCustomers(bookingData: TBookingExtra) {
    console.log('getBookingCustomers: ', bookingData)
    if (!bookingData) return
    const customers = bookingData.customers?.map(x => {
        return {
            name: x.name,
            surname: x.surname,
            phone: x.phone
        }
    })

    console.log('Customers in this room: ', customers?.map(x => x.name), ', ')
    return customers

}