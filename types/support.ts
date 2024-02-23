import { IOrderCustomer } from './order'

export interface ISupportTicket {
    id?: number
    create_at?: string
    update_at?: string
    close_at?: string
    status?: TSupportTicketStatus
    previous_status?: TSupportTicketStatus
    customer?: IOrderCustomer
    messages?: ISupportTicketMessage[]
}

export type TSupportTicketStatus = 'new' | 'inwork' | 'closed'
export type TSupportTicketMessageSender = 'admin' | 'guest'

export interface ISupportTicketMessage {
    message?: string
    create_at?: string
    sender?: string
    sender_type?: TSupportTicketMessageSender
}