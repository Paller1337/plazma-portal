import axios from 'axios';
import { IServiceOrder } from 'types/order'
import { DateTime } from 'luxon'

export async function createServiceOrder(order?: IServiceOrder) {
    const today = DateTime.now().toISODate()
    try {
        const response = await axios.post('https://strapi.kplazma.ru/api/service-orders', {
            data: {
                orderInfo: {
                    status: 'new',
                    createAt: today,
                    completedAt: today,
                    description: 'Тестовый заказ',
                    customer: {
                        name: 'Макс',
                        phone: '+79539539539',
                        room: '1337',
                        guest_account: 7,
                    },
                },
                order: [
                    {
                        service: 3,
                        quantity: 1
                    },
                    {
                        service: 2,
                        quantity: 2
                    },
                ]
            } as IServiceOrder

        })

        return response.data;
    } catch (error) {
        console.error('Ошибка при создании аккаунта гостя:', error);
        throw error; // Переброс ошибки для дальнейшей обработки
    }
}
