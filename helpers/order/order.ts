import axios from 'axios'
import { DEFAULTS } from 'defaults'
import { axiosInstance } from 'helpers/axiosInstance'
import { IOrder } from 'types/order'
import { TServiceOrderStatus } from 'types/services'

export const checkOrderStatus = (status: TServiceOrderStatus) => {
    switch (status) {
        case 'new': return 'Новый'
        case 'delivered': return 'Доставляется'
        case 'done': return 'Выполнен'
        case 'inwork': return 'В работе'
        default: 'Не определен'
    }
}


export async function getOrdersByGuestId(id: number): Promise<IOrder[]> {
    try {
        const response = await axiosInstance.post(`/api/orders`,
            { data: { id: id } }
        )
        // console.log('get Order By Guest Id', response.data.orders)

        const orders: IOrder[] = response.data.orders.data.map(order => ({
            id: order.id,
            create_at: order.attributes.create_at,
            completed_at: order.attributes.completed_at,
            status: order.attributes.status,
            previous_status: order.attributes.previous_status,
            paymentType: order.attributes.paymentType,
            description: order.attributes.description,
            guest: {
                id: order.attributes.guest?.data.id,
                name: order.attributes.guest?.data.attributes.name,
                approved: order.attributes.guest?.data.attributes.approved,
                email: order.attributes.guest?.data.attributes.email,
                mailing: order.attributes.guest?.data.attributes.mailing,
                phone: order.attributes.guest?.data.attributes.phone,
                role: order.attributes.guest?.data.attributes.role,
            },
            products: order.attributes.products?.map(product => ({
                id: product.product.data.id,
                quantity: product.quantity,
            })) || [],//
            iikoProducts: order.attributes.iikoProducts?.map(product => ({
                product: product?.product,
                quantity: product?.quantity,
            })) || [],//
            room: order.attributes.room,//
            phone: order.attributes.phone,
            comment: order.attributes.comment,
            type: {
                label: order.attributes.type?.data?.attributes.label || 'Не определен',
                value: order.attributes.type?.data?.attributes.value || 'undefined',
            },
            store: {
                id: order.attributes.store?.data?.id || 0,
                title: order.attributes.store?.data?.attributes?.title || '-',
            }
        } as IOrder))


        // console.log('Formated Orders ', orders)

        return orders
    } catch (error) {
        console.error(`Ошибка при получении заказов гостя id-${id}:`, error);
        throw error; // Переброс ошибки для дальнейшей обработки
    }
}