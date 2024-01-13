export type TOrderStatus = 'new' | 'inwork' | 'done' | 'delivered'

export interface IOrderCustomer {
    name: string
    phone: string
    room: string
    guest_account: number
}

export interface IOrderInfo {
    status: TOrderStatus
    createAt: string
    completedAt?: string
    description?: string
    customer: IOrderCustomer
}

export interface IServiceOrder {
    orderInfo: IOrderInfo
    order: {
        service: number
        quantity: number
    }[]
}

export type TOrderPaymentType = 'bank-card' | 'cash'