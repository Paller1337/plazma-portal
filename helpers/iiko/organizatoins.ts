import { cacheToRedis, getCachedRedis } from 'helpers/bnovo/auth'
import { IOrganization } from 'types/iiko'
import getIikoToken from './auth'
import axios from 'axios'

// export async function getIikoOrganization(): Promise<IOrganization> {
//     try {
//         const orgs = await getCachedRedis('iikoOrganizations')

//         return {

//         } as IOrganization
//     } catch (error) {
//         console.error(error)
//         return {} as IOrganization
//     }
// }

export async function getIikoOrganization() {
    const redisRes = await getCachedRedis('iikoOrganizations')
    if (redisRes) {
        return JSON.parse(redisRes)
    }

    try {
        const token = await getIikoToken()
        const apiUrl = 'https://api-ru.iiko.services/api/1/organizations'

        const res = await axios.post(apiUrl, {}, {
            headers: {
                'Authorization': `Bearer ${token.token}`,
            }
        })
        await cacheToRedis('iikoOrganizations', JSON.stringify(res.data), 43200)
        const data: IOrganization = await res.data
        
        return data
    } catch (error) {
        console.error(error)
        return {} as IOrganization
    }
}
