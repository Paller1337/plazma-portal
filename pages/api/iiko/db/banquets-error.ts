
import type { NextApiRequest, NextApiResponse } from "next"
import prisma from 'prisma/client'
import { IReserveByPortal } from 'types/admin/banquets'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // console.log('get-banquets req')
    try {
        // const response = await prisma.banquet.findMany()
        const response = await prisma.banquet.findMany({
            where: {
                iikoStatus: 'Error',
            },
        })
        
        const result: IReserveByPortal[] = response.map((x) => ({
            ...x,
            payments: JSON.parse(x.payments as string) || [],
            banquetData: JSON.parse(x.banquetData as string) || [],
        }) as IReserveByPortal)
        // console.log('get-banquets IReserveByPortal ', result)
        if (res) {
            res.status(200).json(result);
        }
    } catch (error) {
        console.error("Произошла ошибка:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
