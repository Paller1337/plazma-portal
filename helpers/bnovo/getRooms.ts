import { TBnovoRoom } from 'types/bnovo';
import { bnovoAuth, cacheToRedis, getCachedRedis } from './auth'
import bnovoClient from './bnovoClient'

export async function getRooms() {
    const redisRooms = await getCachedRedis(`bnovoRooms`)
    if (redisRooms) return JSON.parse(redisRooms)
    
    await bnovoAuth()

    try {
        const response = await bnovoClient.post('https://online.bnovo.ru/room', {
            //
        });
        const data = response.data.rooms as TBnovoRoom[]
    
        await cacheToRedis(`bnovoRooms`, JSON.stringify(data), 86400)
        
        return data
    } catch (error) {
        console.error('Ошибка при получении списка комнат:', error);
        throw error;
    }
}
