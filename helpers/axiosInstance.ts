import axios from 'axios'
import { DEFAULTS } from 'defaults'

// Создание экземпляра axios с базовым URL для стороны сервера
export const axiosInstance = axios.create({
    baseURL: process.env.NODE_ENV === 'production' ? DEFAULTS.PORTAL.url.prod : DEFAULTS.PORTAL.url.dev
});