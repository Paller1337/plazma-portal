import { TOrderPaymentType } from './order'

// types.ts
export interface ServiceImage {
    id: number
    attributes: {
        url: string
        width: number
        height: number
    }
}

export interface IService {
    id: number
    attributes?: {
        title: string
        price: number
        images: {
            data: ServiceImage[]
        }
    }
}

export interface IServiceOrdered {
    service: IService
    quantity: number
}

export interface ServicesResponse {
    data: IService[]
}

export type TServiceOrderStatus = 'new' | 'inwork' | 'done' | 'delivered'
export interface IServiceOrderData {
    id?: number
    status: TServiceOrderStatus
    room: string //'Домик на набережной 3',
    customer: string //'Анастасия Сычева',
    order: IServiceOrdered[],
    comment: string,
    phone: string,
    // paymentAmount: number //1330,
    paymentType: TOrderPaymentType// 'Банковская карта',
}
