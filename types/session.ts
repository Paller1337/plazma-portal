export type TGuestAccountStatus = 'active' | 'expired'

// export interface IGuestAccount {
//     id?: number
//     bnovoBookingId: string
//     firstName: string
//     lastName: string
//     roomId: string
//     checkInDate: string
//     checkOutDate: string
//     status?: TGuestAccountStatus
//     phone?: string
//     email?: string
//     residents?: IGuestAccountResident[]
// }
export interface IGuestAccount {
    id?: number
    name: string
    createdAt?: string
    phone?: string
    email?: string
    approved?: boolean
    mailing?: boolean
    role?: 'user' | 'moderator' | 'admin'
}
// export interface IGuestAccountResident {
//     name?: string
//     middlename?: string
//     surname?: string
//     phone?: string
//     email?: string
//     birthdate?: string
// }