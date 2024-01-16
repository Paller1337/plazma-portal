import axios from 'axios'
import { DEFAULTS } from 'defaults';
import { IGuestAccount } from 'types/session';

export async function createGuestAccount(account: IGuestAccount) {
    try {
        const response = await axios.post(`${DEFAULTS.STRAPI.url}/api/guest-accounts`, {
            data: {
                firstName: account.firstName,
                lastName: account.lastName,
                roomId: account.roomId,
                checkInDate: account.checkInDate,
                checkOutDate: account.checkOutDate,
                bnovoBookingId: account.bnovoBookingId,
                email: account.email,
                phone: account.phone,
                status: 'active',
                residents: account.residents
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
        const response = await axios.get(`${DEFAULTS.STRAPI.url}/api/guest-accounts`, {
            params: {
                'filters[roomId][$eq]': roomId.toLocaleLowerCase(),
                'filters[lastName][$eqi]': surname.toLocaleLowerCase()
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

export async function getGuestAccountByBookingId(bookingId: number) {
    try {
        const response = await axios.get(`${DEFAULTS.STRAPI.url}/api/guest-accounts`, {
            params: {
                'populate': 'deep,3',
                'filters[bnovoBookingId][$eq]': bookingId
            }
        })
        console.log('guest account res: ', response)
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