import { DateTime } from 'luxon';
import { bnovoAuth } from './auth';
import bnovoClient from './bnovoClient';

export default async function verifyBnovoBooking(surname?: string, roomNumber?: string, room?: string) {
    await bnovoAuth() // Убедитесь, что мы авторизованы

    // Получение текущей даты в формате 'YYYY-MM-DD'
    const today = DateTime.now().toISODate()

    try {
        const response = await bnovoClient.post('https://online.bnovo.ru/planning/bookings', {
            dfrom: today,
            dto: today,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        // Фильтрация ответа для поиска бронирования по фамилии и номеру комнаты
        const bookings = response.data; // предполагается, что структура ответа известна
        // const matchingBooking = bookings.find(booking => /* логика для проверки соответствия бронирования */);

        // return matchingBooking ? { isValid: true, bookingDetails: matchingBooking } : { isValid: false };
        return bookings
    } catch (error) {
        console.error('Ошибка при проверке бронирования через Bnovo:', error);
        throw error;
    }
}
