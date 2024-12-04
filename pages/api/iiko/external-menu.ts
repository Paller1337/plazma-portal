
import axios from 'axios'
import { DEFAULTS } from 'defaults'
import { axiosInstance } from 'helpers/axiosInstance'
import type { NextApiRequest, NextApiResponse } from "next"
import prisma from 'prisma/client'
import { IReserveByPortal } from 'types/admin/banquets'

const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        let data = req.body
        switch (req.method) {
            case 'GET':
                console.log('[ExternalMenu GET] ', data)
                const strapiMenus = await axios.get(DEFAULTS.GENERAL_URL.server + '/api/iiko-external-menus', {
                    params: {
                        'populate': 'deep,4',
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${STRAPI_API_TOKEN}`
                    }
                })
                console.log('[StrapiMenus GET] ', strapiMenus.data)
                const menuData = strapiMenus.data.data?.length > 0 ? strapiMenus.data.data?.map(x => ({
                    id: x.id,
                    menuId: x.attributes.menuId,
                    title: x.attributes.title,
                    description: x.attributes.description,
                    fetchDate: x.attributes.fetchDate,
                })) : null

                res.status(200).json(menuData)
                return
            case 'POST':
                console.log('[ExternalMenu POST] ', data)
                const currentMenu = (await axiosInstance.get('/api/iiko/external-menu')).data
                const missingItems = data?.filter(item1 =>
                    !currentMenu.some(item2 => item1.id === item2.menuId?.toString())
                );
                console.log('[ExternalMenu missing POST] ', missingItems)

                if (missingItems?.length > 0) {
                    const toImport = missingItems?.map(item => ({
                        menuId: item.id,
                        title: item.name,
                        fetchDate: new Date(),
                    }));

                    const uploadedMenus = [];
                    // Используем async/await в цикле
                    for (const menu of toImport) {
                        const toPush = await axios.post(DEFAULTS.GENERAL_URL.server + '/api/iiko-external-menus',
                            { data: menu },
                            {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
                                },
                            }
                        );
                        uploadedMenus.push(toPush.data);
                    }

                    // Отправляем ответ только один раз
                    return res.status(200).json({ uploadedMenus });
                }

                // Если нет новых меню для импорта, просто отправляем текущие данные
                return res.status(304).json(currentMenu);

            default:
                res.status(405).json({ message: 'Method Not Allowed' })
                return;
        }
    } catch (error) {
        console.error("Произошла ошибка:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
