import axios from 'axios'
import { IGuestAccount } from 'types/session';

export async function createGuestAccount(account: IGuestAccount) {
    try {
        const response = await axios.post('https://strapi.kplazma.ru/api/guest-accounts', {
            data: {
                firstName: account.firstName,
                lastName: account.lastName,
                roomId: account.roomId,
                checkInDate: account.checkInDate,
                checkOutDate: account.checkOutDate,
                bnovoBookingId: account.bnovoBookingId,
                status: 'active'
            } as IGuestAccount
        });

        return response.data;
    } catch (error) {
        console.error('Ошибка при создании аккаунта гостя:', error);
        throw error; // Переброс ошибки для дальнейшей обработки
    }
}

export async function getGuestAccountByRoomIdAndSurname(roomId: string, surname: string) {
    try {
        const response = await axios.get(`https://strapi.kplazma.ru/api/guest-accounts`, {
            params: {
                'filters[roomId][$eq]': roomId,
                'filters[lastName][$eq]': surname
            }
        })
        console.log('guest room res: ', response)
        if (response.data.data && response.data.data.length > 0) {
            return response.data.data[0]
        } else {
            return null
        }
    } catch (error) {
        console.error('Ошибка при получении аккаунта гостя:', error);
        throw error;
    }
}