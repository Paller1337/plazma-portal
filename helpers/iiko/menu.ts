import { cacheToRedis, getCachedRedis } from 'helpers/bnovo/auth'
import { IIkoMenus, IOrganization } from 'types/iiko'
import getIikoToken from './auth'
import axios from 'axios'
import { DEFAULTS } from 'defaults'

export async function getIikoMenus() {
    const redisRes = await getCachedRedis('iikoMenus')
    if (redisRes) {
        return JSON.parse(redisRes)
    }

    try {
        const token = await getIikoToken()
        const apiUrl = 'https://api-ru.iiko.services/api/2/menu'

        const res = await axios.post(apiUrl, {}, {
            headers: {
                'Authorization': `Bearer ${token.token}`,
            }
        })

        // console.log('MENUS: ', res.data)
        await cacheToRedis('iikoMenus', JSON.stringify(res.data), 43200)
        const data: IIkoMenus = await res.data

        return data
    } catch (error) {
        console.error(error)
        return {} as IIkoMenus
    }
}

export async function getIikoMenuById(menuId: string) {
    const redisRes = await getCachedRedis(`iikoMenuId-${menuId}`)
    if (redisRes) {
        return JSON.parse(redisRes)
    }

    try {
        const token = await getIikoToken()
        const apiUrl = 'https://api-ru.iiko.services/api/2/menu/by_id'

        const res = await axios.post(apiUrl,
            {
                organizationIds: [
                    DEFAULTS.IIKO.organizations.smash
                ],
                externalMenuId: menuId,
            },
            {
                headers: {
                    'Authorization': `Bearer ${token.token}`,
                }
            })

        console.log('MENU: ', res.data)
        await cacheToRedis(`iikoMenuId-${menuId}`, JSON.stringify(res.data), 3600)
        const data: IIkoMenus = await res.data

        return data
    } catch (error) {
        console.error(error)
        return {} as IIkoMenus
    }
}
