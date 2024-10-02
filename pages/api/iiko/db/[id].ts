import { DateTime } from 'luxon';
import { NextApiRequest, NextApiResponse } from 'next'
import prisma from 'prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    // Валидация идентификатора
    if (typeof id !== 'string' || !id.trim()) {
        return res.status(400).json({ error: 'Invalid banquet ID' });
    }

    const banquetId = id;
    let response
    const nowDate = DateTime.now().toSQL({ includeOffset: false })

    try {
        switch (req.method) {
            case 'GET':
                response = await prisma.banquet.findUnique({
                    where: { id: banquetId },
                })

                if (!response) throw new Error("Banquet not found");
                else if (response.isDeleted) {
                    throw new Error("Banquet is Deleted");
                }

                if (res) {
                    res.status(200).json(response);
                }
                break

            case 'PUT':
                // Смена статуса на "sent"
                // if (req.method === 'PUT') {
                console.log('Смена статуса на "sent": ', req.method)
                response = await prisma.banquet.update({
                    where: { id: banquetId },
                    data: { status: "sent" },
                });

                if (!response) throw new Error("Banquet not found");
                else if (response.isDeleted) {
                    throw new Error("Banquet is Deleted");
                }

                return res.status(204).json({
                    id: banquetId,
                    status: "sent",
                    message: "Status changed to sent successfully",
                });
                // }
                break

            case 'PATCH':
                // Редактирование банкета
                const updatedData = JSON.parse(req.body)

                console.log('api PATCH Banquet: ', updatedData.status)
                response = await prisma.banquet.update({
                    where: { id: banquetId },
                    data: {
                        ...updatedData,
                        editedAt: nowDate,
                        banquetData: JSON.stringify(updatedData.banquetData),
                        payments: JSON.stringify(updatedData.payments),
                    },
                })

                if (!response) res.status(404).json({
                    id: banquetId,
                    status: "failed",
                    message: "Banquet not found",
                })

                else if (response.isDeleted) res.status(400).json({
                    id: banquetId,
                    status: "failed",
                    message: "Banquet is deleted",
                })

                return res.json({
                    id: banquetId,
                    status: "updated",
                    message: "Banquet successfully updated",
                })
                break

            case 'DELETE':
                // Удаление (скрытие) банкета
                response = await prisma.banquet.update({
                    where: { id: banquetId },
                    data: { isDeleted: true }
                })

                if (!response) res.status(404).json({ error: 'Banquet not found' });

                return res.status(204).json({ id: banquetId, message: "Deleted successfully" });

            default:
                return res.status(405).end();
        }
    } catch (error) {
        // Общая обработка ошибок
        console.error(error);
        return res.status(500).json({ error: 'An internal server error occurred' });
    }
}
