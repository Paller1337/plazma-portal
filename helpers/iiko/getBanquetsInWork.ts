import { fetchReserveOrganizations, fetchReserveRestaurantSections, fetchReserveStatusById, fetchReserveTerminalGroups, fetchRestaurantSectionsWorkload } from './iikoClientApi'

export const getBanquetInWork = async () => {
    const reserveOrganizations = await fetchReserveOrganizations()

    const reserveTerminalGroups = await fetchReserveTerminalGroups({ organizationIds: [reserveOrganizations?.organizations[0].id] })
    const reserveRestaurantSections = await fetchReserveRestaurantSections({ terminalGroupIds: [reserveTerminalGroups?.terminalGroups[0].items[1].id] })

    const restaurantSectionIds = reserveRestaurantSections.restaurantSections.map((item) => item.id)
    const restaurantSectionsWorkload = await fetchRestaurantSectionsWorkload({ restaurantSectionIds: restaurantSectionIds, dateFrom: '2019-08-24 14:15:22.123' })

    const reserveIds = restaurantSectionsWorkload.reserves.map((item) => item.id)
    const reserveStatusById = await fetchReserveStatusById({ organizationId: reserveOrganizations.organizations[0].id, reserveIds: reserveIds })

    // console.log('reserveStatusById: ', reserveStatusById)
    return reserveStatusById
}