import { IServiceOrdered } from './services'

export type TOrderStatus = 'new' | 'inwork' | 'done' | 'delivered'

export interface IOrderCustomer {
    name: string
    phone: string
    room: string
    guest_account: {
        id: number
        bnovoBookingId: string
        checkInDate: string
        checkOutDate: string
        email: string
        firstName: string
        lastName: string
        phone: string
        roomId: string
        status: string
    };
}



export interface IOrderInfo {
    status: TOrderStatus
    createAt: string
    completedAt?: string
    description?: string
    customer: IOrderCustomer
    paymentType: TOrderPaymentType
}

export interface IServiceOrder {
    id: number
    orderInfo: IOrderInfo
    order: IServiceOrdered[]
}

export type TOrderPaymentType = 'bank-card' | 'cash'