import { TServiceOrderStatus } from 'types/services'

export const checkOrderStatus = (status: TServiceOrderStatus) => {
    switch (status) {
        case 'new': return 'Новый'
        case 'delivered': return 'Доставляется'
        case 'done': return 'Выполнен'
        case 'inwork': return 'В работе'
        default: 'Не определен'
    }
}