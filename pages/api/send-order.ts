// pages/api/send-order.js

const TelegramBot = require('node-telegram-bot-api')

// Токен Telegram бота и ID чата для отправки сообщений
const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_CHAT_ID

const bot = new TelegramBot(TOKEN)

function formatOrderMessage(order) {
    let message = '<b>Новый заказ!</b>\n'

    // Форматирование раздела услуг
    if (order.services.items.length > 0) {
        message += '\n<b>Услуги:</b>\n'
        order.services.items.forEach(item => {
            message += `- ${item.title} (Количество: ${item.quantity}, Цена: ${item.price} руб.)\n`
        })
        message += `\n<b>Общая сумма по услугам:</b> ${order.services.total} руб.\n`
    }

    // Форматирование раздела еды
    if (order.food.items.length > 0) {
        message += '\nЕда:\n'
        order.food.items.forEach(item => {
            message += `- ${item.title} (Количество: ${item.quantity}, Цена: ${item.price} руб.)\n`
        })
        message += `Общая сумма по еде: ${order.food.total} руб.\n`
    }

    return message
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const order = req.body
            const message = formatOrderMessage(order)

            await bot.sendMessage(CHAT_ID, message, { parse_mode: 'HTML' })
            res.status(200).json({ message: 'Заказ успешно отправлен в Telegram' })
        } catch (error) {
            console.error('Ошибка при отправке заказа:', error)
            res.status(500).json({ error: 'Ошибка при отправке заказа' })
        }
    } else {
        // Обрабатываем только POST-запросы
        res.setHeader('Allow', ['POST'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}