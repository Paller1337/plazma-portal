import { IPaymentSystem } from 'pages/store/[id]'
import { IServiceOrdered } from './services'
import { IGuestAccount } from './session'

export type TOrderStatus = 'new' | 'inwork' | 'done' | 'delivered' | 'none' | 'null' | 'canceled'

// export interface IOrderCustomer {
//     name: string
//     phone: string
//     room: string
//     guest_account: {
//         id: number
//         bnovoBookingId: string
//         checkInDate: string
//         checkOutDate: string
//         email: string
//         firstName: string
//         lastName: string
//         phone: string
//         roomId: string
//         status: string
//     };
// }



export interface IOrder {
    id: number
    create_at: string
    completed_at?: string
    status: TOrderStatus
    previous_status: TOrderStatus
    paymentType: TOrderPaymentType
    description?: string
    guest: IGuestAccount
    products: IOrderProduct[]
    iikoProducts: IOrderIikoProduct[]
    room: IRoomInfo
    phone: string
    comment?: string
    type: IStoreType
    store: IStore
    isVisualNew?: boolean
    paid_for: boolean
    approve: boolean
    payment_system: IPaymentSystem
    cancelReason: {
        cancel_reason: {
            id: number
            name: string
            title: string
        },
        metadata: any
    }
}

export interface IRoomInfo {
    label: string
    roomId: string
}
export interface IOrderProduct {
    id: number
    quantity: number
}

export interface IOrderIikoProduct {
    product: string
    quantity: number
    price: number
    stoplist: boolean
}

export interface IProduct {
    id: string
    name: string
    memo_text: string
    description: string
    price: number
    for_sale: boolean
    image: string
    store: IStore
    warning_text: string
}

export interface IStore {
    id: number
    title: string
    description: string
    image: string
    category: string
    tag: string
    preview_size: 'min' | 'std' | 'big'
    short_desc: string
    products: IProduct[]
    isActive: boolean
    store_type: IStoreType
    isCustom?: boolean
    customId?: string
}

export interface IStoreType {
    id: number
    label: string
    value: string
}
// export interface IServiceOrder {
//     id: number
//     orderInfo: IOrderInfo
//     order: IServiceOrdered[]
// }

export type TOrderPaymentType = 'bank-card' | 'cash' | 'external'