import { bnovoAuth } from './auth'
import bnovoClient from './bnovoClient'

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
