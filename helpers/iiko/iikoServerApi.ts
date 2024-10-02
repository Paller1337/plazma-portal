import { Config } from './IikoApi/config'
import { IikoAPI } from './IikoApi/IikoAPI'

const iikoApiConfig: Config = {
    apiKey: process.env.IIKO_API_KEY || '',
    baseURL: process.env.IIKO_BASE_URL || 'https://api-ru.iiko.services',
    redis: {
        host: process.env.REDIS_PORTAL_HOST || 'ru.tuna.am',
        port: parseInt(process.env.REDIS_PORTAL_PORT) || 38909,
        password: process.env.REDIS_PORTAL_PASS || '',
        // host: '95.163.214.158',
        // port: 6379,
        // password: 'PlazmaR3di$2023',
    },
    loggingLevel: 'info',
    retryOptions: {
        maxAttempts: 3,
        initialDelayMs: 200,
    },
}

export const iikoApiServer = new IikoAPI(iikoApiConfig)
