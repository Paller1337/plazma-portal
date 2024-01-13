import axios from 'axios';
import { IServiceOrder } from 'types/order'
import { DateTime } from 'luxon'

export async function createServiceOrder(order?: IServiceOrder) {
    try {
        const response = await axios.post('https://strapi.kplazma.ru/api/service-orders', {
            data: {
                orderInfo: order.orderInfo,
                order: order.order
            } as IServiceOrder

        })

        return response.data;
    } catch (error) {
        console.error('Ошибка при создании аккаунта гостя:', error);
        throw error; // Переброс ошибки для дальнейшей обработки
    }
}


export async function getServiceOrders() {
    try {
        const response = await axios.get('https://strapi.kplazma.ru/api/service-orders', {
            params: {
                'populate': 'deep,4',
            }
        })
        // console.log('response services ', response.data.data)
        return response.data.data;
    } catch (error) {
        console.error('Ошибка при создании аккаунта гостя:', error);
        throw error; // Переброс ошибки для дальнейшей обработки
    }
}
