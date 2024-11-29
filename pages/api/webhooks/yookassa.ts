import axios from 'axios';
import { DEFAULTS } from 'defaults';
import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

// Конфигурация транспортера для отправки писем
const transporter = nodemailer.createTransport({
    host: "mail.kplazma.ru",
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN

// Функция для безопасного экранирования текста для HTML
const escapeHtml = (text: string): string =>
    text.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            // Считываем тело запроса
            const body = req.body;
            const id = body.object.id
            const status = body.object.status
            console.log({
                type: 'YooKassa WebHook',
                id, status
            })



            const payment = (await axios.get(DEFAULTS.GENERAL_URL.server + '/api/payments',
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
                    },
                }
            ))?.data
                .data?.find(ps => ps.attributes.payment_id === id)
            // console.log({ payment })
            if (payment) {
                const updatePayment = (await axios.put(DEFAULTS.GENERAL_URL.server + '/api/payments/' + payment.id,
                    {
                        data: {
                            status: status
                        }
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
                        },
                    }
                ))
                // console.log({ updatePayment, newStatus: status })
            }
            // Преобразуем JSON в читаемый формат с отступами
            const formattedBody = JSON.stringify(body, null, 2);

            // Экранируем текст для безопасного отображения в HTML
            const escapedBody = escapeHtml(formattedBody);

            // Функция для отправки письма
            const send = async (toEmail: string) => {
                await transporter.sendMail({
                    from: 'noreply@kplazma.ru',
                    to: toEmail,
                    subject: `[WebHooks: YooKassa]`,
                    html: `<pre>${escapedBody}</pre>` // Используем <pre> для читаемого отображения
                });
            };

            // Отправка письма
            await send('max@kplazma.ru');

            res.status(200).json({ message: 'Сообщение успешно отправлено' });
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
