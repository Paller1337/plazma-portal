import axios from 'axios'
import { DEFAULTS } from 'defaults'

// Создание экземпляра axios с базовым URL для стороны сервера
export const axiosInstance = axios.create({
    baseURL: DEFAULTS.GENERAL_URL.app,
});

// Добавление интерсептора для обработки ответов
// axiosInstance.interceptors.response.use(
//     function (response) {
//         // Любой код состояния, находящийся в диапазоне 2xx, вызывает эту функцию
//         return response;
//     },
//     function (error) {
//         // Любой код состояния, находящийся вне диапазона 2xx, вызывает эту функцию
//         if (error.response && error.response.status === 404) {
//             // Подавление ошибки 404
//             console.log('404 Not Found обработан как нормальный исход');
//             return Promise.resolve(error.response);
//         }
//         // Для всех остальных ошибок возвращаем промис с ошибкой
//         return Promise.reject(error);
//     }
// );