import { IPaymentStatus } from '@a2seven/yoo-checkout'
import { IOrder } from 'types/order'


export type TExternalPaymentSystem = 'yookassa' | 'yookassa_test'

interface IGetPaymentType {
    order: IOrder
    type: 'default' | 'system' | 'staff'
}
export const getPaymentType = ({ order, type }: IGetPaymentType) => {
    switch (order?.paymentType) {
        case 'bank-card':
            return 'Банковская карта'
        case 'cash':
            return 'Наличные'
        case 'external':
            switch (type) {
                case 'system':
                    return order?.payment_system?.title_system
                case 'staff':
                    return order?.payment_system?.title_staff
                case 'default':
                    return order?.payment_system?.title
                default:
                    return 'Не найден'
            }
        default:
            return 'Не указан'
    }
}

export const getPaymentStatus = ({ status }: { status: IPaymentStatus }) => {
    switch (status) {
        case 'canceled':
            return {
                staff: 'Оплата отменена',
                guest: 'Оплата отменена',
            }
        case 'pending':
            return {
                staff: 'Ожидание оплаты',
                guest: 'Ожидание оплаты',
            }
        case 'succeeded':
            return {
                staff: 'Оплачен',
                guest: 'Оплачен',
            }
        case 'waiting_for_capture':
            return {
                staff: 'Необходимо подтверждение',
                guest: 'Обрабатывается',
            }
        default:
            return {
                staff: 'Оплата отсутствует',
                guest: 'Оплата отсутствует',
            }
    }
}