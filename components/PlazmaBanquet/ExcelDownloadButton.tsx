import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { DateTime } from 'luxon'
import { IBanquetOrderItem, NomenclatureResponse, Reserve, ReserveCreateRequest, ReserveCreateResponse, ReserveProductItem, ReserveStatusByIdResponse } from 'helpers/iiko/IikoApi/types'
import { IReserveByPortal, IReserveByPortalPayment } from 'types/admin/banquets'
import { Menu, rem } from '@mantine/core'
import { IconFileSpreadsheet } from '@tabler/icons-react'

export interface ExcelDownloadProps {
    dataReserve?: Reserve,
    dataBanquet?: IReserveByPortal,
    payments?: IReserveByPortalPayment[],
    nomenclature: NomenclatureResponse
}

export default function ExcelDownloadButton(props: ExcelDownloadProps) {
    const paymentsSum = props.payments?.reduce((result, { sum }) => result + (sum as number), 0) || 0
    const type = props.dataReserve ? 'reserve' : 'banquet'

    const infoMap = props.dataReserve
        ? {
            customer: props.dataReserve.reserve?.customer.name,
            guests: props.dataReserve.reserve?.guestsCount,
            orderNumber: props.dataReserve.reserve?.order?.number,
            estimatedStartTime: DateTime.fromSQL(props.dataReserve.reserve?.estimatedStartTime).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY),
            todayWeekday: DateTime.now().toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY),
            phone: props.dataReserve.reserve?.phone,
            processedPaymentsSum: props.dataReserve.reserve?.order?.processedPaymentsSum,
            // processedPaymentsSum: props.payments?.reduce((result, { sum }) => result + (sum as number), 0) || 0,
            comment: props.dataReserve.reserve?.comment,
            orderItems: props.dataReserve.reserve?.order?.items as ReserveProductItem[],
        }
        : {
            customer: props.dataBanquet?.banquetData.customer.name,
            guests: props.dataBanquet?.banquetData.guests.count,
            orderNumber: props.dataBanquet?.idN,
            estimatedStartTime: DateTime.fromSQL(props.dataBanquet?.banquetData.estimatedStartTime as string).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY),
            todayWeekday: DateTime.now().toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY),
            phone: props.dataBanquet?.banquetData.phone,
            processedPaymentsSum: paymentsSum,

            comment: props.dataBanquet?.banquetData.comment,
            orderItems: props.dataBanquet?.banquetData.order?.items as IBanquetOrderItem[],
        }

    const exportToExcel = async () => {
        const nomenclature = props.nomenclature

        // Загрузка шаблона
        const response = await fetch('/assets/template/banquetTemplate.xlsx');
        const buffer = await response.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);

        // Получение первого листа
        const worksheet = workbook.getWorksheet(1);
        worksheet.getColumn(1).width = 18;
        worksheet.getColumn(2).width = 18;
        worksheet.properties.defaultRowHeight = 20;

        // Заполнение данными
        worksheet.getCell('B1').value = infoMap.orderNumber;
        worksheet.getCell('B2').value = infoMap.estimatedStartTime;
        worksheet.getCell('B2').style = {
            alignment: {
                horizontal: 'right',
            },
            border: {
                bottom: {
                    style: 'thin'
                }
            }
        }
        worksheet.getCell('B3').value = infoMap.todayWeekday;
        worksheet.getCell('B3').style = {
            alignment: {
                horizontal: 'right',
            }
        }

        worksheet.getCell('B4').value = infoMap.customer
        worksheet.getCell('B5').value = infoMap.phone;
        worksheet.getCell('B6').value = infoMap.processedPaymentsSum
        worksheet.getCell('B7').value = infoMap.comment;
        // ... и так далее для всех полей

        let startOrderList = 11
        const templateRow = worksheet.getRow(startOrderList);

        // const cutRows = worksheet.spliceRows(13, 4)


        // worksheet.duplicateRow(startOrderList, infoMap.orderItems.length - 1, true)

        let rowStart = startOrderList; // начальная строка для списка блюд

        console.log('infoMap.orderItems: ', infoMap)
        infoMap.orderItems.forEach((item, index) => {
            const rowNumber = rowStart + index;

            // Дублирование строки-шаблона
            const newRow = worksheet.getRow(rowNumber);
            templateRow.eachCell((cell, colNumber) => {
                newRow.getCell(colNumber).style = { ...cell.style };
            });

            // Объединение ячеек, как в строке-шаблоне
            try {
                worksheet.unMergeCells(`A${rowNumber}:B${rowNumber}`);
                // worksheet.unMergeCells(`F${rowNumber}:G${rowNumber}`);
                worksheet.mergeCells(`A${rowNumber}:B${rowNumber}`);
                // worksheet.mergeCells(`F${rowNumber}:G${rowNumber}`);
            } catch (error) {
                console.error('Error merging cells:', error);
            }

            // Заполнение новой строки данными
            newRow.getCell(1).value = type === 'reserve' ? (item as ReserveProductItem).product.name :
                nomenclature ? nomenclature?.products.find(x => x.id === (item as IBanquetOrderItem).productId)?.name : '';  // A
            newRow.getCell(3).value = item.amount;        // C
            newRow.getCell(4).value = 'шт.';              // D
            newRow.getCell(5).value = item.price;         // E
            newRow.getCell(6).value = type === 'reserve' ? (item as ReserveProductItem).cost :
                parseFloat((item as IBanquetOrderItem).price) * ((item as IBanquetOrderItem).amount || 0);          // F
            newRow.getCell(7).value = item.comment;          // G
            newRow.height = 18
            // Сохранение изменений в новой строке
            newRow.commit();
        });

        const lastRow = startOrderList + infoMap.orderItems.length

        const borderStyle = {
            color: {
                argb: '#000000'
            },
            style: 'thin'
        }

        const borderAllBoldRow = {
            alignment: {
                horizontal: 'right',
                vertical: 'bottom',
            },
            font: {
                bold: true,
                size: 11
            },
            border: {
                bottom: borderStyle,
                top: borderStyle,
                left: borderStyle,
                right: borderStyle,
            }
        } as ExcelJS.Style

        const cellSignStyle = {
            font: {
                bold: true,
                size: 11,
            },
            alignment: {
                horizontal: 'left',
                vertical: 'bottom',
            },
            border: {
                bottom: borderStyle,
            }
        } as ExcelJS.Style

        const rowSum = worksheet.getRow(lastRow)
        rowSum.height = 30
        rowSum.getCell(6).value = 'Итоговая сумма:';
        rowSum.getCell(6).style = borderAllBoldRow
        rowSum.getCell(7).value = props.dataReserve?.reserve.order.sum || (infoMap.orderItems as IBanquetOrderItem[])
            .reduce((sum, { price, amount }) => sum + parseFloat(price) * amount, 0);

        rowSum.getCell(7).style = { ...borderAllBoldRow, alignment: { horizontal: 'right' } }

        const rowSign = worksheet.getRow(lastRow + 2)
        rowSign.getCell(6).value = 'Подпись';

        rowSign.getCell(6).style = { font: { bold: true, size: 11 } }
        rowSign.getCell(7).value = ''
        rowSign.getCell(7).style = cellSignStyle
        rowSign.height = 20

        // Сохранение файла
        const newBuffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([newBuffer]),
            `Банкет ${infoMap.estimatedStartTime} ${infoMap.customer}.xlsx`);
    };


    return (
        <Menu.Item leftSection={< IconFileSpreadsheet color='green' style={{ width: rem(18), height: rem(18) }} />}
            onClick={() => exportToExcel()} >
            Скачать
        </Menu.Item>
    )
}