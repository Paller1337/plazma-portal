export type TGuestAccountStatus = 'active' | 'expired'

export interface IGuestAccount {
    id?: number
    bnovoBookingId: string
    firstName: string
    lastName: string
    roomId: string
    checkInDate: string
    checkOutDate: string
    status?: TGuestAccountStatus
}