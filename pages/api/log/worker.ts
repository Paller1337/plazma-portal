export default function handler(req, res) {
    if (req.method === 'POST') {
        // Получение данных из тела запроса
        const { event, data } = req.body;

        // Логирование данных на сервере
        console.log(`Лог события из Service Worker: ${event}`, data);

        // Отправка ответа
        res.status(200).json({ message: 'Лог получен' });
    } else {
        // Обработка остальных методов
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
