import { TBnovoRoom } from 'types/bnovo';
import { bnovoAuth } from './auth'
import bnovoClient from './bnovoClient'

export async function getRooms() {
    await bnovoAuth()

    try {
        const response = await bnovoClient.post('https://online.bnovo.ru/room', {
            //
        });
        const data = response.data.rooms as TBnovoRoom[]

        return data
    } catch (error) {
        console.error('Ошибка при получении списка комнат:', error);
        throw error;
    }
}
