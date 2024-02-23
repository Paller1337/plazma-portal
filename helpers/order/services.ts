import axios from 'axios';
import { IOrderInfo, IServiceOrder, TOrderStatus } from 'types/order'
import { DateTime } from 'luxon'
import { IService, IServiceOrderData, IServiceOrdered } from 'types/services';
import { ICServiceOrderProps } from '@/components/admin/ServiceOrder';
import { DEFAULTS } from 'defaults';
import { IServiceOrderWithEntering } from 'pages/admin/services';

export async function createServiceOrder(order) {
    try {
        const response = await axios.post(`${DEFAULTS.STRAPI.url}/api/service-orders`, {
            data: {
                orderInfo: order.orderInfo as IOrderInfo,
                order: order.order
            }

        })

        return response.data;
    } catch (error) {
        console.error('Ошибка при создании аккаунта гостя:', error);
        throw error; // Переброс ошибки для дальнейшей обработки
    }
}

export async function updateServiceOrderStatus(props: ICServiceOrderProps, status: TOrderStatus, newStatus: TOrderStatus) {
    try {
        const response = await axios.put(`${DEFAULTS.STRAPI.url}/api/service-orders/${props.id}`, {
            data: {
                orderInfo: {
                    ...props.orderInfo, // Сохраняем все существующие поля
                    create_at: props.orderInfo.createAt,
                    customer: {
                        ...props.orderInfo.customer,
                        guest_account: props.orderInfo.customer.guest_account.id
                    },
                    status: newStatus,
                    previous_status: status,
                }
            }
        });
        // console.log('New Order Info: ', {
        //     orderInfo: {
        //         ...props.orderInfo, // Сохраняем все существующие поля
        //         create_at: props.orderInfo.createAt,
        //         customer: {
        //             ...props.orderInfo.customer,
        //             guest_account: props.orderInfo.customer.guest_account.id
        //         },
        //         status: newStatus,
        //         previous_status: status
        //     }
        // })

        // console.log('guest_account: ', {
        //     guest_account: props.orderInfo.customer.guest_account
        // })
        return response.data;
        // return
    } catch (error) {
        console.error('Ошибка при обновлении статуса заказа:', error);
        throw error;
    }
}



export async function getServiceOrders() {
    try {
        const response = await axios.get(`${DEFAULTS.STRAPI.url}/api/service-orders`, {
            params: {
                'sort[id]': `desc`,
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

export async function getServiceOrdersByGuestId(id: number): Promise<IServiceOrder[]> {
    try {
        const response = await axios.get(`${DEFAULTS.STRAPI.url}/api/service-orders`, {
            params: {
                // 'sort': "created_at:DESC",
                'filters[orderInfo][customer][guest_account][id][$eq]': id,
                'sort[orderInfo][create_at]': `desc`,
                'populate': 'deep,4',
            }
        })

        return response.data.data;
    } catch (error) {
        console.error('Ошибка при создании аккаунта гостя:', error);
        throw error; // Переброс ошибки для дальнейшей обработки
    }
}

export function servicesFromRes(res){
    const orders = res.map(x => {
        const guestAccountData = x.attributes.orderInfo.customer.guest_account.data;
        // console.log('guestAccountData ', guestAccountData)
        const orderInfo: IOrderInfo = {
            status: x.attributes.orderInfo.status,
            createAt: x.attributes.createdAt,
            completedAt: x.attributes.orderInfo.completed_at,
            description: x.attributes.orderInfo.description,
            customer: {
                name: x.attributes.orderInfo.customer.name,
                room: x.attributes.orderInfo.customer.room,
                phone: x.attributes.orderInfo.customer.phone,
                guest_account: {
                    id: guestAccountData.id,
                    ...guestAccountData.attributes
                }
            },
            paymentType: x.attributes.orderInfo.paymentType
        };

        const orderData = x.attributes.order.map(item => {

            // console.log('service.item: ', item)
            return {
                service: item.service.data,
                quantity: item.quantity,
            } as IServiceOrdered
        })

        return {
            id: x.id,
            orderInfo,
            order: orderData
        } as IServiceOrder
    })
    return orders as IServiceOrder[]
}
export function normalizeServiceOrderData(data) {
    const orderItems = data.order.map(item => {
        const service = {
            id: item.service.id,
            attributes: {
                title: item.service.title,
                price: item.service.price,
                images: {
                    data: item.service.images.map(image => ({
                        id: image.id,
                        attributes: {
                            url: image.url,
                            width: image.width,
                            height: image.height
                        }
                    }))
                }
            }
        } as IService

        return {
            service: service,
            quantity: item.quantity
        };
    });

    return {
        id: data.id,
        orderInfo: {
            customer: data.orderInfo.customer,
            paymentType: data.orderInfo.paymentType,
            createAt: data.orderInfo.createAt,
            status: data.orderInfo.status,
            description: data.orderInfo.description
        },
        // id: data.id,
        // status: data.orderInfo.status,
        // room: data.orderInfo.customer.room,
        // customer: data.orderInfo.customer.name,
        order: orderItems,
        // comment: data.orderInfo.description,
        // phone: data.orderInfo.customer.phone,
        // paymentType: data.orderInfo.paymentType
    } as IServiceOrderWithEntering
}