
import { DateTime } from 'luxon'
import { NextApiRequest, NextApiResponse } from 'next'
import prisma from 'prisma/client'
import { IReserveByPortal } from 'types/admin/banquets'

async function generateNewIdN(banquets: Record<string, any>) {
    let maxIdN

    // Создание динамической части даты
    const now = DateTime.now()
    const datePart = now.toFormat("yyyyLL")

    if (Object.keys(banquets).every((key) => !banquets[key].idN)) {
        maxIdN = Object.keys(banquets).length;
    } else {
        maxIdN = 0;
        for (const key in banquets) {
            const banquet = banquets[key];
            if (banquet && banquet.idN) {
                const [, idNPart] = banquet.idN.split("-");
                const idNNumber = parseInt(idNPart, 10);
                maxIdN = Math.max(maxIdN, idNNumber);
            }
        }
    }

    const newIdN = (maxIdN + 1).toString().padStart(4, "0");
    return `${datePart}-${newIdN}`
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case 'POST':
            const data: IReserveByPortal = req.body


            const banquets = await prisma.banquet.findMany()

            const newId = Date.now().toString()
            const nowDate = DateTime.now().toSQL({ includeOffset: false })
            const newIdN = await generateNewIdN(banquets)

            const response = await prisma.banquet.create({
                data: {
                    ...data,
                    id: newId,
                    idN: newIdN,
                    createdAt: nowDate,
                    editedAt: nowDate,
                    payments: JSON.stringify(data.payments),
                    banquetData: JSON.stringify(data.banquetData),
                },
            })

            return res.json(response)
    }
};
