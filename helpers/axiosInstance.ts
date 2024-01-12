import axios from 'axios'

// Создание экземпляра axios с базовым URL для стороны сервера
export const axiosInstance = axios.create({
    baseURL: process.env.NODE_ENV === 'production' ? 'https://portal.kplazma.ru' : 'http://localhost:5000'
});