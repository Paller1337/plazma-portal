// import { IOrderCustomer } from './order'

import { IRoomInfo } from './order'
import { IGuestAccount } from './session'

export interface ISupportTicket {
    id?: number
    create_at?: string
    update_at?: string
    close_at?: string
    status?: TSupportTicketStatus
    previous_status?: TSupportTicketStatus
    // customer?: IOrderCustomer
    guest?: IGuestAccount
    messages?: ISupportTicketMessage[]
    room: IRoomInfo
    isVisualNew?: boolean
}

export type TSupportTicketStatus = 'new' | 'inwork' | 'closed' | 'null'
export type TSupportTicketMessageSender = 'admin' | 'guest'

export interface ISupportTicketMessage {
    message?: string
    create_at?: string
    sender?: string
    sender_type?: TSupportTicketMessageSender
}