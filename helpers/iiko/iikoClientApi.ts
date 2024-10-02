import { DEFAULTS } from 'defaults'
import { AvailableRestaurantSectionsResponse, CommandStatusResponse, MenusV2Response, MenuV2ByIdRequest, MenuV2ByIdResponse, NomenclatureResponse, OrganizationResponse, ReserveCreateResponse, ReserveStatusByIdResponse, RestaurantSectionsWorkloadResponse, TerminalGroupsResponse } from './IikoApi/types'
import { IReserveByPortal } from 'types/admin/banquets'

const apiUrl = DEFAULTS.MAIN_URL

export async function fetchOrganizations(): Promise<OrganizationResponse> {
    const response = await fetch(apiUrl + '/api/iiko/organizations')

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка при получении организаций')
    }

    const data: OrganizationResponse = await response.json()

    return data
}

export async function fetchReserveOrganizations(): Promise<OrganizationResponse> {
    const response = await fetch(apiUrl + '/api/iiko/reserve_available_organizations')

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка при получении организаций')
    }

    const data: OrganizationResponse = await response.json()
    return data
}

export async function fetchTerminalGroups(params: { organizationIds: string[] }): Promise<TerminalGroupsResponse> {
    const response = await fetch(apiUrl + '/api/iiko/terminal-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка при получении терминальных групп')
    }

    const data: TerminalGroupsResponse = await response.json()
    return data
}

export async function fetchReserveTerminalGroups(params: { organizationIds: string[] }): Promise<TerminalGroupsResponse> {
    const response = await fetch(apiUrl + '/api/iiko/reserve_available_terminal_groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка при получении терминальных групп')
    }

    const data: TerminalGroupsResponse = await response.json()
    return data
}

export async function fetchReserveRestaurantSections(params: { terminalGroupIds: string[] }): Promise<AvailableRestaurantSectionsResponse> {
    const response = await fetch(apiUrl + '/api/iiko/reserve_available_restaurant_sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка при получении подразделений ресторана')
    }

    const data: AvailableRestaurantSectionsResponse = await response.json()
    return data
}

export async function fetchRestaurantSectionsWorkload(params: { restaurantSectionIds: string[], dateFrom: string, dateTo?: string }): Promise<RestaurantSectionsWorkloadResponse> {
    const response = await fetch(apiUrl + '/api/iiko/reserve_restaurant_sections_workload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    })

    // console.log('RestaurantSectionsWorkloadResponse res: ', response)
    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка при получении активных банкетов')
    }

    const data: RestaurantSectionsWorkloadResponse = await response.json()
    return data
}

export async function fetchReserveStatusById(params: { organizationId: string, reserveIds: string[], sourceKeys?: string }): Promise<ReserveStatusByIdResponse> {
    const response = await fetch(apiUrl + '/api/iiko/reserve_status_by_id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    })

    // console.log('RestaurantSectionsWorkloadResponse res: ', response)
    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка при получении информации о банкетах')
    }

    const data: ReserveStatusByIdResponse = await response.json()
    return data
}


export async function fetchCommandStatus(params: { organizationId: string, correlationId: string }): Promise<CommandStatusResponse> {
    const response = await fetch(apiUrl + '/api/iiko/command_status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка при получении информации о команде')
    }

    const data: CommandStatusResponse = await response.json()
    return data
}

export async function fetchNomenclature(params: { organizationId: string }): Promise<NomenclatureResponse> {
    const response = await fetch(apiUrl + '/api/iiko/nomenclature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка при получении номенклатуры')
    }

    const data: NomenclatureResponse = await response.json()
    return data
}

export async function fetchMenusV2(): Promise<MenusV2Response> {
    const response = await fetch(apiUrl + '/api/iiko/menus_v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка при получении списка меню')
    }

    const data: MenusV2Response = await response.json()
    return data
}

export async function fetchMenuByIdV2(params: MenuV2ByIdRequest): Promise<MenuV2ByIdResponse> {
    const response = await fetch(apiUrl + '/api/iiko/menu_by_id_v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Ошибка при получении меню ID:${params.externalMenuId}`)
    }

    const data: MenuV2ByIdResponse = await response.json()
    return data
}

export async function postCreateReserve(params: IReserveByPortal): Promise<ReserveCreateResponse> {
    const b = params.banquetData
    const response = await fetch(apiUrl + '/api/iiko/create_reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(b),
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Ошибка при передаче банкета:${params.id}`)
    }

    const data: ReserveCreateResponse = await response.json()
    return data
}

