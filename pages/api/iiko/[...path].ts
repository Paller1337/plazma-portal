
import { iikoApiServer } from 'helpers/iiko/iikoServerApi'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query

  let organizationIds, organizationId, terminalGroupIds, restaurantSectionIds, dateFrom, dateTo, reserveIds, sourceKeys, correlationId, externalMenuId
  try {
    switch (path[0]) {
      case 'organizations':
        const organizations = await iikoApiServer.getOrganizations()
        // console.log(organizations)
        res.status(200).json(organizations)
        break

      case 'reserve_available_organizations':
        const reserve_available_organizations = await iikoApiServer.getReserveOrganizations()
        // console.log(organizations)
        res.status(200).json(reserve_available_organizations)
        break

      case 'terminal-groups':
        organizationIds = req.body.organizationIds
        if (!organizationIds || !Array.isArray(organizationIds)) {
          return res.status(400).json({ error: 'Необходимо предоставить массив organizationIds в теле запроса' })
        }
        const terminalGroups = await iikoApiServer.getTerminalGroups(organizationIds)
        res.status(200).json(terminalGroups)
        break

      case 'reserve_available_terminal_groups':
        organizationIds = req.body.organizationIds
        if (!organizationIds || !Array.isArray(organizationIds)) {
          return res.status(400).json({ error: 'Необходимо предоставить массив organizationIds в теле запроса' })
        }
        const reserve_available_terminal_groups = await iikoApiServer.getAvailableTerminalGroups(organizationIds)
        res.status(200).json(reserve_available_terminal_groups)
        break

      case 'reserve_available_restaurant_sections':
        terminalGroupIds = req.body.terminalGroupIds
        if (!terminalGroupIds || !Array.isArray(terminalGroupIds)) {
          return res.status(400).json({ error: 'Необходимо предоставить массив terminalGroupIds в теле запроса' })
        }
        const reserve_available_restaurant_sections = await iikoApiServer.getAvailableRestaurantSections(terminalGroupIds)
        res.status(200).json(reserve_available_restaurant_sections)
        break

      case 'reserve_restaurant_sections_workload':
        restaurantSectionIds = req.body.restaurantSectionIds
        dateFrom = req.body.dateFrom
        dateTo = req.body.dateTo

        if (!restaurantSectionIds || !Array.isArray(restaurantSectionIds)) {
          return res.status(400).json({ error: 'Необходимо предоставить массив restaurantSectionIds в теле запроса' })
        }
        if (!dateFrom) {
          return res.status(400).json({ error: 'Необходимо предоставить переменную dateFrom в теле запроса' })
        }
        const reserve_restaurant_sections_workload = await iikoApiServer.getRestaurantSectionsWorkload(restaurantSectionIds, dateFrom, dateTo)
        res.status(200).json(reserve_restaurant_sections_workload)
        break

      case 'reserve_status_by_id':
        organizationId = req.body.organizationId
        reserveIds = req.body.reserveIds
        sourceKeys = req.body.sourceKeys

        console.log('organizationId: ', organizationId)
        console.log('reserveIds: ', reserveIds)
        if (!organizationId) {
          return res.status(400).json({ error: 'Необходимо предоставить переменную organizationIds в теле запроса' })
        }
        if (!reserveIds) {
          return res.status(400).json({ error: 'Необходимо предоставить переменную reserveIds в теле запроса' })
        }
        const reserve_status_by_id = await iikoApiServer.getReserveStatusById(organizationId, reserveIds, sourceKeys)
        res.status(200).json(reserve_status_by_id)
        break

      case 'command_status':
        organizationId = req.body.organizationId
        correlationId = req.body.correlationId

        if (!organizationId) {
          return res.status(400).json({ error: 'Необходимо предоставить переменную organizationIds в теле запроса' })
        }
        if (!correlationId) {
          return res.status(400).json({ error: 'Необходимо предоставить переменную correlationId в теле запроса' })
        }
        const command_status = await iikoApiServer.getCommandStatus(organizationId, correlationId)
        res.status(200).json(command_status)
        break

      case 'nomenclature':
        organizationId = req.body.organizationId
        if (!organizationId) {
          return res.status(400).json({ error: 'Необходимо предоставить organizationId в теле запроса' })
        }
        const nomenclature = await iikoApiServer.getNomenclature(organizationId)
        res.status(200).json(nomenclature)
        break

      case 'menus_v2':
        const menus_v2 = await iikoApiServer.getMenusV2()
        res.status(200).json(menus_v2)
        break

      case 'menu_by_id_v2':
        organizationIds = req.body.organizationIds
        externalMenuId = req.body.externalMenuId
        if (!organizationIds) {
          return res.status(400).json({ error: 'Необходимо предоставить organizationId в теле запроса' })
        }

        if (!externalMenuId) {
          return res.status(400).json({ error: 'Необходимо предоставить ID внешнего меню в теле запроса' })
        }

        const menu_by_id_v2 = await iikoApiServer.getMenuByIdV2({ externalMenuId, organizationIds })
        res.status(200).json(menu_by_id_v2)
        break

      case 'create_reserve':
        const data = req.body
        const create_reserve = await iikoApiServer.createReserve(data)
        res.status(200).json(create_reserve)
        break


      // Добавьте дополнительные кейсы по необходимости
      default:
        res.status(404).json({ error: 'Не найдено' })
    }
  } catch (error) {
    console.error('Ошибка при обращении к IikoAPI.')
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
}