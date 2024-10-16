import { ISupportTicket } from 'types/support';
import { axiosInstance } from './axiosInstance';
import { IOrder } from 'types/order';
import { DateTime } from 'luxon';

export async function telegramSend(message: string, chat_id, message_thread_id) {
    console.log(`telegramSend: `, { message, chat_id, message_thread_id })

    const status = await axiosInstance.post('/api/telegram/send', {
        message,
        chat_id,
        message_thread_id
    })

    if (status.status === 200) return true
    else return false
}


export async function telegramSendFeedback(stars: string) {
    let message = `<b>[PORTAL RATING]</b>\n`
    message += `Новая оценка: <b>${stars}</b>\n`

    const res = await telegramSend(message, -1002259481861, 2)
    return res
}

export async function telegramSendTicket(ticket: ISupportTicket) {
    let message = `<b>[PORTAL SUPPORT]</b>\n`
    message += `Нужна помощь гостю: <b>${ticket.guest.name}</b>\n`
    message += `Номер проживания: <b>${ticket.room.label}</b>\n`
    message += `Телефон: <b>${ticket.guest.phone}</b>\n`
    message += `Сообщение: <pre>${ticket.messages[0].message}</pre>\n`

    const res = await telegramSend(message, -1002259481861, 12)
    return res
}

export async function telegramSendOrder(order: IOrder) {
    let message = '[PORTAL DELIVERY]\n'
    message += '<b>Новый заказ!</b>\n'
    // message += `<b>ID заказа:</b> ${order.id}\n`
    message += `Тип заказа: <b>${order.type.label}</b>\n`
    message += `Время заказа: <b>${DateTime.fromISO(order.create_at).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)}</b>\n`
    message += `Способ оплаты: <b>${order.paymentType === 'bank-card' ? 'Безналичный расчет' : 'Наличные'}</b>\n`
    message += `Магазин: <b>${order.store.title}</b>\n\n`
    message += `Гость: <b>${order.guest.name}</b>\n`
    message += `Комната: <b>${order.room.label}</b>\n`
    message += `Комментарий: <pre>${order.comment}</pre>\n`
    // console.log(`[PORTAL DELIVERY]`, { message })
    // message += '\n<b>Товары:</b>\n';
    // order.products.forEach(item => {
    //     message += `- ${item.} (Количество: ${item.quantity}, Цена: ${item.price} руб.)\n`;
    // });
    // message += `\n<b>Общая сумма:</b> ${order.} руб.\n`;

    const res = await telegramSend(message, -1002259481861, 4)
    return res
}


export async function telegramSendCode(code: string, phone: string) {
    let message = '[PORTAL CODE]\n'
    message += `<b>Номер отправителя: ${phone}</b>\n`
    message += `<b>Код: ${code}</b>\n`
    const res = await telegramSend(message, -1002259481861, 28)
    return res
}