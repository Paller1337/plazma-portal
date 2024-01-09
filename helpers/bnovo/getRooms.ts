import { bnovoAuth } from './auth'
import bnovoClient from './bnovoClient'

export async function getRooms() {
    await bnovoAuth() // Убедитесь, что мы авторизованы

    try {
        const response = await bnovoClient.post('https://online.bnovo.ru/room', {
            // Параметры запроса, если они нужны
        });

        return response.data;
    } catch (error) {
        console.error('Ошибка при получении списка комнат:', error);
        throw error;
    }
}
