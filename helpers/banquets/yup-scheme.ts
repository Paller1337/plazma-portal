import { IReserveByPortal } from 'types/admin/banquets';
import * as yup from 'yup';

export const schema = yup.object({
    // id: yup.string().optional(),
    // createdAt: yup.string().optional(),
    // editedAt: yup.string().optional(),
    // idN: yup.string().optional(),
    // serviceNote: yup.string().optional(),
    // status: yup.string().oneOf(['not_sent', 'sent']).required('Статус обязателен'),
    // isDeleted: yup.boolean().optional(),
    // needSum: yup.number().optional(),
    // payments: yup.array().of(
    //     yup.object({
    //         date: yup.string().optional(),
    //         type: yup.string().oneOf(['CARD', 'CASH', 'TRANSFER']).required('Тип платежа обязателен'),
    //         sum: yup.number().required('Сумма платежа обязательна'),
    //     }).required()
    // ).optional(),

    banquetData: yup.object({
        // organizationId: yup.string().required('Организация обязательна'),
        // terminalGroupId: yup.string().optional(),
        // id: yup.string().optional(),
        // externalNumber: yup.string().optional(),

        order: yup.object({
            menuId: yup.string().optional(),
            items: yup.array().of(
                yup.object({
                    productId: yup.string().required('ID продукта обязательно'),
                    modifiers: yup.array().of(
                        yup.object({
                            productId: yup.string().required('ID модификатора обязательно'),
                            amount: yup.number().required('Количество модификатора обязательно'),
                            productGroupId: yup.string().optional(),
                            price: yup.number().optional(),
                            positionId: yup.string().optional(),
                        })
                    ).optional(),
                    price: yup.string().required('Цена обязательна'),
                    positionId: yup.string().optional(),
                    type: yup.string().oneOf(['Product', 'Compound']).required('Тип продукта обязателен'),
                    amount: yup.number().required('Количество продукта обязательно'),
                    productSizeId: yup.string().optional(),
                    comboInformation: yup.object({
                        comboId: yup.string().optional(),
                        comboSourceId: yup.string().optional(),
                        comboGroupId: yup.string().optional(),
                    }).optional(),
                    comment: yup.string().optional(),
                })
            ).required('Список товаров обязателен'),
            combos: yup.array().of(
                yup.object({
                    id: yup.string().required('ID комбо обязательно'),
                    name: yup.string().required('Название комбо обязательно'),
                    amount: yup.number().required('Количество комбо обязательно'),
                    price: yup.number().required('Цена комбо обязательна'),
                    sourceId: yup.string().required('Source ID обязателен'),
                    programId: yup.string().optional(),
                    sizeId: yup.string().optional(),
                })
            ).optional(),
            payments: yup.array().of(
                yup.object({
                    number: yup.number().optional(),
                    paymentTypeKind: yup.string().required('Тип платежа обязателен'),
                    sum: yup.number().required('Сумма обязательна'),
                    paymentTypeId: yup.string().required('ID типа платежа обязателен'),
                    isProcessedExternally: yup.boolean().optional(),
                    paymentAdditionalData: yup.object({
                        type: yup.string().required('Тип дополнительных данных обязателен'),
                    }).optional(),
                    isFiscalizedExternally: yup.boolean().optional(),
                    isPrepay: yup.boolean().optional(),
                })
            ).optional(),
            tips: yup.array().of(
                yup.object({
                    number: yup.number().optional(),
                    paymentTypeKind: yup.string().oneOf(['Cash', 'Card', 'External']).required('Тип чаевых обязателен'),
                    tipsTypeId: yup.string().required('ID типа чаевых обязателен'),
                    sum: yup.number().required('Сумма чаевых обязательна'),
                    paymentTypeId: yup.string().required('ID типа платежа обязателен'),
                    isProcessedExternally: yup.boolean().required('Поле обязательно'),
                    paymentAdditionalData: yup.object({
                        type: yup.string().required('Тип дополнительных данных обязателен'),
                    }).required('Дополнительные данные обязательны'),
                    isFiscalizedExternally: yup.boolean().required('Поле обязательно'),
                    isPrepay: yup.boolean().required('Поле обязательно'),
                })
            ).optional(),
            sourceKey: yup.string().optional(),
            discountsInfo: yup.object({
                card: yup.object({
                    track: yup.string().required('Трек карты обязателен'),
                }).optional(),
                discounts: yup.array().of(
                    yup.object({
                        type: yup.string().required('Тип скидки обязателен'),
                    })
                ).optional(),
            }).optional(),
            loyaltyInfo: yup.object({
                coupon: yup.string().required('Купон обязателен'),
                applicableManualConditions: yup.array().of(yup.string()).required('Условия обязательны'),
            }).optional(),
            orderTypeId: yup.string().optional(),
            chequeAdditionalInfo: yup.object({
                needReceipt: yup.boolean().required('Поле обязательно'),
                email: yup.string().email('Некорректный email').optional(),
                settlementPlace: yup.string().optional(),
                phone: yup.string().optional(),
            }).optional(),
            externalData: yup.array().of(
                yup.object({
                    key: yup.string().required('Ключ обязателен'),
                    value: yup.string().required('Значение обязательно'),
                    isPublic: yup.boolean().required('Поле обязательно'),
                })
            ).optional(),
        }).optional(),

        customer: yup.object({
            name: yup
                .string()
                .max(60, 'Имя не должно превышать 60 символов')
                .required('Имя заказчика обязательно'),
            type: yup.string().oneOf(['one-time']).required('Тип заказчика обязателен'),
        }).required('Информация о заказчике обязательна'),

        // phone: yup.string().required('Номер телефона обязателен').matches(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/, 'Некорректный формат номера'),

        // comment: yup.string().optional(),

        // durationInMinutes: yup.number().required('Длительность обязательна').min(30, 'Минимальная длительность 30 минут'),

        // shouldRemind: yup.boolean().required('Поле обязательно'),

        // tableIds: yup.array().of(yup.string()).required('Необходимо выбрать столы'),

        // estimatedStartTime: yup.string().required('Дата и время обязательны'),

        // guests: yup.object({
        //     count: yup.number().required('Количество гостей обязательно').min(1, 'Минимум 1 гость'),
        // }).optional(),

        // eventType: yup.string().optional(),
    }).required('Данные банкета обязательны'),
}) as yup.ObjectSchema<IReserveByPortal>
