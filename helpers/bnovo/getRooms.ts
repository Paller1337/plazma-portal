import { TBnovoRoom } from 'types/bnovo';
import { bnovoAuth } from './auth'
import bnovoClient from './bnovoClient'
import { cacheToRedis, getCachedRedis } from 'helpers/redis';
import axios from 'axios';
import { DEFAULTS } from 'defaults';

const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN

// export async function getRooms() {
//     const strapiRooms = await axios.get(DEFAULTS.GENERAL_URL.server + '/api/hotel-rooms', {
//         params: {
//             'populate': 'deep,4',
//         },
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${STRAPI_API_TOKEN}`
//         }
//     })

//     const roomsData = strapiRooms.data.data?.length > 0 ? strapiRooms.data.data?.map(x => ({
//         id: x.id,
//         meta_system_name: x.attributes.meta_system_name,
//         name: x.attributes.name,
//         meta_system_id: x.attributes.meta_system_id,
//         sort_priority: x.attributes.sort_priority,
//         meta_hotel_id: x.attributes.meta_hotel_id,
//         isActive: x.attributes.isActive,
//     })) : null


//     console.log('[StrapiRooms GET] ', roomsData)
//     // console.log res
//     // [StrapiRooms GET]  [
//     //     {
//     //       id: 1,
//     //       meta_system_name: 'Кабинет 105',
//     //       name: 'Номер как на Бали ',
//     //       meta_system_id: '12032',
//     //       sort_priority: 100,
//     //       meta_hotel_id: '12345',
//     //       isActive: true
//     //     }
//     //   ]

//     const redisRooms = await getCachedRedis(`bnovoRooms`)
//     const redisRoomsObjects = JSON.parse(redisRooms)

//     console.log('[getCachedRedis] ', redisRoomsObjects)
//     // console.log res
//     // [getCachedRedis]  [
//     //     {
//     //       id: '966592',
//     //       hotel_id: '2368',
//     //       room_type_id: '517606',
//     //       room_type_name: null,
//     //       name: 'Номер 308',
//     //       tags: 'Евростандарт 308',
//     //       sort_order: '0',
//     //       clean_status: null,
//     //       room_type: 'Евростандарт первый этаж 4х местный'
//     //     },
//     //     {
//     //       id: '966593',
//     //       hotel_id: '2368',
//     //       room_type_id: '517606',
//     //       room_type_name: null,
//     //       name: 'Номер 309',
//     //       tags: 'Евростандарт 309',
//     //       sort_order: '0',
//     //       clean_status: null,
//     //       room_type: 'Евростандарт первый этаж 4х местный'
//     //     },
//     //     {
//     //       id: '1172218',
//     //       hotel_id: '2368',
//     //       room_type_id: '625517',
//     //       room_type_name: null,
//     //       name: '91',
//     //       tags: '',
//     //       sort_order: '0',
//     //       clean_status: null,
//     //       room_type: 'Спортивная деревня 2'
//     //     }
//     //   ]

//     if (redisRooms) {
//         return JSON.parse(redisRooms)
//     }
//     await bnovoAuth()

//     try {
//         const response = await bnovoClient.post('https://online.bnovo.ru/room', {
//             //
//         });
//         const data = response.data.rooms as TBnovoRoom[]

//         await cacheToRedis(`bnovoRooms`, JSON.stringify(data), 86400)

//         return data
//     } catch (error) {
//         console.error('Ошибка при получении списка комнат:', error);
//         throw error;
//     }
// }

export interface IHotelRoom {
    id: number
    meta_system_name: string
    name: string
    meta_system_id: string
    sort_priority: number
    meta_hotel_id: string
    meta_room_type: string
    isActive: string
}
export async function getRooms(): Promise<IHotelRoom[]> {
    console.log('[Get Rooms]')
    // Получение данных из Strapi
    const strapiResponse = await axios.get(DEFAULTS.GENERAL_URL.server + '/api/hotel-rooms', {
        params: {
            'populate': 'deep,4',
            pagination: {
                limit: 1000, // Максимум 500 записей
            },
        },
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${STRAPI_API_TOKEN}`
        }
    })
    console.log('[Get strapiResponse]')
    // return strapiResponse
    const strapiRooms = strapiResponse.data.data.map((x) => ({
        id: x.id,
        meta_system_name: x.attributes.meta_system_name,
        name: x.attributes.name,
        meta_system_id: x.attributes.meta_system_id,
        sort_priority: x.attributes.sort_priority,
        meta_hotel_id: x.attributes.meta_hotel_id,
        meta_room_type: x.attributes.meta_room_type,
        isActive: x.attributes.isActive,
    }));

    console.log('[Strapi Rooms Length]', strapiRooms.length);

    // Получение данных из кеша или Bnovo API
    let bnovoRooms = JSON.parse(await getCachedRedis('bnovoRooms') || 'null');
    console.log('[Bnovo Rooms]', bnovoRooms.length);
    if (!bnovoRooms) {
        await bnovoAuth();
        try {
            const response = await bnovoClient.post('https://online.bnovo.ru/room', {});
            bnovoRooms = response.data.rooms.map((room) => ({
                id: room.id,
                name: room.name,
                tags: room.tags,
                hotel_id: room.hotel_id,
                sort_order: room.sort_order,
            }));
            await cacheToRedis('bnovoRooms', JSON.stringify(bnovoRooms), 86400);
        } catch (error) {
            console.error('Ошибка при получении данных из Bnovo:', error);
            throw error;
        }
    }

    // Определяем недостающие комнаты
    const missingRooms = bnovoRooms.filter(
        (bnovoRoom) =>
            !strapiRooms.some(
                (strapiRoom) => String(strapiRoom.meta_system_id) === String(bnovoRoom.id)
            )
    );

    console.log('[Missing Rooms]', missingRooms.length);

    if (missingRooms.length > 0) {
        // Преобразуем недостающие комнаты в нужный формат
        const roomsToAdd = missingRooms.map((room) => ({
            meta_system_name: room.name,
            name: room.tags,
            meta_system_id: room.id,
            sort_priority: 1,
            meta_hotel_id: room.hotel_id,
            meta_room_type: room.room_type,
            isActive: false,
        }));

        try {
            // Массовое добавление недостающих комнат через bulk-create
            const bulkCreateResponse = await axios.post(
                `${DEFAULTS.GENERAL_URL.server}/api/hotel-room/bulk-create`,
                { data: roomsToAdd },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
                    },
                }
            );

            console.log(`[Bulk Create] Успешно добавлено ${bulkCreateResponse.data.length} комнат.`);
        } catch (error) {
            console.error('Ошибка при массовом добавлении комнат:', error);
        }
    }

    // Возвращаем обновлённый список комнат из Strapi
    return strapiRooms;
}

