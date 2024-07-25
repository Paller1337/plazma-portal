const TelegramBot = require('node-telegram-bot-api');

// Токен Telegram бота и ID чата для отправки сообщений
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const bot = new TelegramBot(TOKEN);

function formatOrderMessage(order) {
    let message = '<b>Новый заказ!</b>\n';
    message += `<b>ID заказа:</b> ${order.id}\n`;
    message += `<b>Тип заказа:</b> ${order.type}\n`;
    message += `<b>Время заказа:</b> ${order.time}\n`;
    message += `<b>Комментарий:</b> ${order.comment}\n`;
    message += `<b>Телефон:</b> ${order.phone}\n`;
    message += `<b>Способ оплаты:</b> ${order.payment}\n`;
    message += `<b>Статус:</b> ${order.status}\n`;
    message += `<b>Магазин:</b> ${order.store}\n`;
    message += `<b>Гость:</b> ${order.guest}\n`;
    message += `<b>Комната:</b> ${order.room.label}\n`;

    message += '\n<b>Товары:</b>\n';
    order.items.forEach(item => {
        message += `- ${item.name} (Количество: ${item.quantity}, Цена: ${item.price} руб.)\n`;
    });

    message += `\n<b>Общая сумма:</b> ${order.total} руб.\n`;

    return message;
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const order = req.body;
            const message = formatOrderMessage(order);

            await bot.sendMessage(CHAT_ID, message, { parse_mode: 'HTML' });
            res.status(200).json({ message: 'Заказ успешно отправлен в Telegram' });
        } catch (error) {
            console.error('Ошибка при отправке заказа:', error);
            res.status(500).json({ error: 'Ошибка при отправке заказа' });
        }
    } else {
        // Обрабатываем только POST-запросы
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
