import axios from 'axios'
import { DEFAULTS } from 'defaults'
import { cacheToRedis, getCachedRedis } from 'helpers/bnovo/auth'
import { IiikoToken } from 'types/iiko'

export default async function getIikoToken(): Promise<IiikoToken> {
    const login = DEFAULTS.IIKO.login
    const token = await getCachedRedis('iikoToken')
    if (token) {
        return {
            token: token,
            correlationId: 'redisCache'
        }
    }

    try {
        const apiUrl = 'https://api-ru.iiko.services/api/1/access_token'
        const res = await axios.post(apiUrl, {
            'apiLogin': login
        })
        await cacheToRedis('iikoToken', res.data.token, 600)

        return {
            token: res.data.token,
            correlationId: res.data.correlationId
        } as IiikoToken
    } catch (error) {
        console.error(error)
        
        return {} as IiikoToken
    }
}