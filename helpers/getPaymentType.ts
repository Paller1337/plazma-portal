import { TOrderPaymentType } from 'types/order'

export const getPaymentType = (paymentType: TOrderPaymentType) => {
    switch (paymentType) {
        case 'bank-card':
            return 'Банковская карта'
        case 'cash':
            return 'Наличные'
        case 'yookassa':
            return 'Онлайн (ЮКасса)'
        default:
            return 'Не указан'
    }
}