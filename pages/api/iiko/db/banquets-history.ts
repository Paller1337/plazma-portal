
import type { NextApiRequest, NextApiResponse } from "next"
import prisma from 'prisma/client'
import { IReserveByPortal } from 'types/admin/banquets'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // console.log('get-banquets req')
    try {
        // const response = await prisma.banquet.findMany()
        const response = await prisma.banquet.findMany()
        const result: IReserveByPortal[] = response.map((x) => ({
            id: x.id,
            idN: x.idN,
            createdAt: x.createdAt,
            editedAt: x.editedAt,
            status: x.status,
            payments: JSON.parse(x.payments as string) || [],
            needSum: x.needSum,
            banquetData: JSON.parse(x.banquetData as string) || [],
            isDeleted: x.isDeleted,
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
