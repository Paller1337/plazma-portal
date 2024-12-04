
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
                const strapiPortalMenus = await axios.get(DEFAULTS.GENERAL_URL.server + '/api/portal-menu', {
                    params: {
                        'populate': 'deep,4',
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${STRAPI_API_TOKEN}`
                    }
                })
                console.log('[StrapiMenus GET] ', strapiPortalMenus.data)
                const resData = strapiPortalMenus.data?.data?.attributes?.iiko_external_menus?.data.map(item => ({
                    menuId: item?.attributes?.menuId,
                    title: item?.attributes?.title,
                    description: item?.attributes?.description,
                    fetchDate: item?.attributes?.fetchDate,
                }))

                res.status(200).json(resData)
                return

            default:
                res.status(405).json({ message: 'Method Not Allowed' })
                return;
        }
    } catch (error) {
        console.error("Произошла ошибка:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
