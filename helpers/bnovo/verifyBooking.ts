import { bnovoAuth } from './auth';
import bnovoClient from './bnovoClient';

export default async function verifyBnovoBooking(surname?: string, roomNumber?: string, dfrom?: string, dto?: string) {
    await bnovoAuth() // Убедитесь, что мы авторизованы

    try {
        const response = await bnovoClient.post('https://online.bnovo.ru/planning/bookings', {
            dfrom: '2024-01-01',
            dto: '2024-01-06',
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
