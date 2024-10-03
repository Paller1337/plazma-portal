import { NextApiRequest, NextApiResponse } from 'next';
import TelegramBot from 'node-telegram-bot-api';
import nodemailer from 'nodemailer'

// Токен Telegram бота и ID чата для отправки сообщений
const TOKEN = process.env.TELEGRAM_BOT_TOKEN

const bot = new TelegramBot(TOKEN, { polling: false })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { chat_id, message, message_thread_id } = req.body; // Предполагаем, что body уже является объектом
            console.log({ chat_id }, { message }, { message_thread_id });

            if (!message) res.status(400).json({ message: 'Сообщение не должно быть пустым' });
            if (!chat_id) res.status(400).json({ message: 'Укажите ID чата' });

            await bot.sendMessage(chat_id, message, {
                parse_mode: 'HTML',
                message_thread_id
            })

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
