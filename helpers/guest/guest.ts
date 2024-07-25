import axios from 'axios';
import { DEFAULTS } from 'defaults';
import { axiosInstance } from 'helpers/axiosInstance';
import { IGuestAccount } from 'types/session';

export async function updateGuestAccountStatus(id: number, newStatus: 'active' | 'expired') {
    try {
        const guest = await axiosInstance.get(`/api/guest/${id}`)
        if (guest.status === 200) {
            console.log('guest-data: ', guest.data)

            const response = await axios.put(`${DEFAULTS.STRAPI.url}/api/guest-accounts/${id}`, {
                data: {
                    bnovoBookingId: guest.data.data.attributes.bnovoBookingId,
                    checkInDate: guest.data.data.attributes.checkInDate,
                    checkOutDate: guest.data.data.attributes.checkOutDate,
                    firstName: guest.data.data.attributes.firstName,
                    lastName: guest.data.data.attributes.lastName,
                    roomId: guest.data.data.attributes.roomId,
                    email: guest.data.data.attributes.email,
                    phone: guest.data.data.attributes.phone,
                    residents: guest.data.data.attributes.residents,
                    status: newStatus
                } as IGuestAccount
            });

            console.log(response.data)
            return response.data;
        }
        return {}
    } catch (error) {
        console.error('Ошибка при обновлении статуса заказа:', error);
        throw error;
    }
}


export async function updateGuestLivingDate(id: number, bookingId, checkInDate, checkOutDate) {
    try {
        const guest = await axiosInstance.get(`/api/guest/${id}`)
        if (guest.status === 200) {
            console.log('guest-data: ', guest.data)

            const response = await axios.put(`${DEFAULTS.STRAPI.url}/api/guest-accounts/${id}`, {
                data: {
                    bnovoBookingId: bookingId,
                    checkInDate: checkInDate,
                    checkOutDate: checkOutDate,
                    firstName: guest.data.data.attributes.firstName,
                    lastName: guest.data.data.attributes.lastName,
                    roomId: guest.data.data.attributes.roomId,
                    email: guest.data.data.attributes.email,
                    phone: guest.data.data.attributes.phone,
                    residents: guest.data.data.attributes.residents,
                    status: guest.data.data.attributes.status
                } as IGuestAccount
            });

            console.log(response.data)
            return response.data;
        }
        return {}
    } catch (error) {
        console.error('Ошибка при обновлении статуса заказа:', error);
        throw error;
    }
}
