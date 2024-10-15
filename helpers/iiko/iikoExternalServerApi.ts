import { Config } from './IikoApi/config'
import { IikoAPI } from './IikoApi/IikoAPI'

console.log(process.env.IIKO_EXTERNAL_API_KEY)
const iikoApiConfig: Config = {
    apiKey: process.env.IIKO_EXTERNAL_API_KEY || '',
    baseURL: process.env.IIKO_BASE_URL || 'https://api-ru.iiko.services',
    redis: {
        host: process.env.REDIS_PORTAL_HOST || 'ru.tuna.am',
        port: parseInt(process.env.REDIS_PORTAL_PORT) || 38909,
        password: process.env.REDIS_PORTAL_PASS || '',
    },
    loggingLevel: 'info',
    retryOptions: {
        maxAttempts: 3,
        initialDelayMs: 200,
    },
    cachePrefix: 'portal:menu:'
}

export const iikoExternalServerApi = new IikoAPI(iikoApiConfig)
