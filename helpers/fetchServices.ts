import { ServicesResponse } from 'types/services'

export async function fetchServices(): Promise<ServicesResponse> {
    const res = await fetch('https://strapi.kplazma.ru/api/services?populate=*')
    if (!res.ok) {
        throw new Error(`Failed to fetch services, received status ${res.status}`)
    }
    const data: ServicesResponse = await res.json()
    return data
}
