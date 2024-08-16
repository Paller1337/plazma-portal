// self.addEventListener('push', event => {
//     const data = event.data.json();
//     self.registration.showNotification(data.title, {
//         body: data.body,
//     })
// })

self.addEventListener('push', function (event) {
    // Извлекаем данные из push-события
    const data = event.data.json()

    // Функция для отправки логов на сервер
    const sendLogToServer = async (logData) => {
        try {
            const response = await fetch('https://8511u9-178-252-214-43.ru.tuna.am/api/log/worker', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(logData)
            });
            if (!response.ok) {
                console.error('Ошибка при отправке логов на сервер:', response.statusText);
            }
        } catch (error) {
            console.error('Ошибка при отправке логов:', error);
        }
    };

    // Отправка логов на сервер
    sendLogToServer({ event: 'push', data });

    // Опции для уведомления
    const options = {
        body: data.body,
        icon: 'icons/icon-72x72.png'
    };

    // Используем waitUntil для того, чтобы удерживать сервис-воркер активным
    // пока не будет показано уведомление
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    )
})

self.addEventListener('notificationclick', event => {
    const data = event.notification.data.json()
    event.notification.close()
    event.waitUntil(
        clients.openWindow(data.url)
    );
});
