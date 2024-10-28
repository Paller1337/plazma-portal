import { IBanquetOrderItem, ReserveCreateRequest } from 'helpers/iiko/IikoApi/types'

type BanquetIikoStatus = 'new' | 'Error' | 'Success' | 'InProgress'
export interface IReserveByPortal extends Record<string, unknown> {
    id?: string,
    createdAt?: string
    editedAt?: string
    iikoId?: string
    iikoStatus?: BanquetIikoStatus
    iikoMessage?: string
    idN?: string,
    serviceNote?: string
    status: 'not_sent' | 'sent'
    isDeleted?: boolean
    banquetData: ReserveCreateRequest
    needSum?: number
    needPersonSum?: number
    payments?: IReserveByPortalPayment[]
}

export interface IReserveByPortalPayment {
    date?: string
    type?: 'CARD' | 'CASH' | 'TRANSFER'
    sum?: number
}

export interface IBanquetOrderItemWithState extends IBanquetOrderItem {
    isCounting?: boolean
}