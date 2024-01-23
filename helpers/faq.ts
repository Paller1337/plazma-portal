import { DEFAULTS } from 'defaults'
import { axiosInstance } from './axiosInstance'

export async function getFAQList() {
    try {
        const response = await axiosInstance.get(`/api/faq`)
        console.log('response services ', response.data)
        return response.data.data
    } catch (error) {
        console.error('Ошибка при получении FAQ:', error);
        throw error; // Переброс ошибки для дальнейшей обработки
    }
}
