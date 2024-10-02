import { NextApiRequest, NextApiResponse } from 'next';
import TelegramBot from 'node-telegram-bot-api';
import nodemailer from 'nodemailer'

// Токен Telegram бота и ID чата для отправки сообщений
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const bot = new TelegramBot(TOKEN, { polling: false });

const transporter = nodemailer.createTransport({
    host: "mail.kplazma.ru",
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
})

function escapeHtml(text) {
    return text.replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Функция для безопасного парсинга JSON-строк
function safeParseJSON(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error('Некорректный JSON:', jsonString);
        return jsonString; // Возвращаем исходную строку, если парсинг не удался
    }
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const body = req.body[0]; // Предполагаем, что body уже является объектом

            // Глубоко клонируем объект body, чтобы не изменять исходные данные
            const clonedBody = JSON.parse(JSON.stringify(body));

            // Проверяем и парсим поля 'message' и 'description'
            if (clonedBody.eventInfo?.errorInfo) {
                if (typeof clonedBody.eventInfo.errorInfo.message === 'string') {
                    clonedBody.eventInfo.errorInfo.message = safeParseJSON(clonedBody.eventInfo.errorInfo.message);
                }

                if (typeof clonedBody.eventInfo.errorInfo.description === 'string') {
                    clonedBody.eventInfo.errorInfo.description = safeParseJSON(clonedBody.eventInfo.errorInfo.description);
                }
            }

            // Преобразуем модифицированный объект в форматированную строку JSON
            const sendString = JSON.stringify(clonedBody, null, 2);
            const send = async (toEmail: string) => {
                await transporter.sendMail({
                    from: 'noreply@kplazma.ru',
                    to: toEmail,
                    subject: `Ошибка [IIKO API: RESERVE BOT]`,
                    html: `<pre>${sendString}</pre>`
                });
            }

            // Формирование сообщения для Telegram
            let message = `<b>[IIKO API BOT]</b>\n`;
            message += `<b>Тип события:</b> ${body?.eventType}\n`;
            message += `<b>Время:</b> ${body?.eventTime}\n`;

            if (body?.eventType === 'ReserveError') {
                await send('max@kplazma.ru')
            }
            // Отправка сообщения в Telegram
            await bot.sendMessage(CHAT_ID, message, { parse_mode: 'HTML' });


            res.status(200).json({ message: 'Сообщение успешно отправлено в Telegram' });
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
            res.status(500).json({ error: 'Ошибка при отправке сообщения' });
        }
    } else {
        // Обрабатываем только POST-запросы
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Метод ${req.method} не поддерживается`);
    }
}
