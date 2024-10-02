import { zodResolver } from 'mantine-form-zod-resolver'
import { z } from 'zod'

export const banquetOrderItemSchema = z.object({
    productId: z.string().min(1, 'ID продукта обязательно'),
    modifiers: z
        .array(
            z.object({
                productId: z.string().min(1, 'ID модификатора обязательно'),
                amount: z.number().min(1, 'Количество модификатора обязательно'),
                productGroupId: z.string().optional(),
                price: z.number().optional(),
                positionId: z.string().optional(),
            })
        )
        .optional(),
    price: z.string().min(1, 'Цена обязательна'),
    positionId: z.string().optional(),
    type: z.enum(['Product', 'Compound']),
    amount: z.number().min(1, 'Количество продукта обязательно'),
    productSizeId: z.string().optional(),
    comboInformation: z
        .object({
            comboId: z.string().optional(),
            comboSourceId: z.string().optional(),
            comboGroupId: z.string().optional(),
        })
        .optional(),
    comment: z.string().optional(),
});

export const orderPaymentSchema = z.object({
    number: z.number().optional(),
    paymentTypeKind: z.string().min(1, 'Тип платежа обязателен'),
    sum: z.number().min(1, 'Сумма обязательна'),
    paymentTypeId: z.string().min(1, 'ID типа платежа обязателен'),
    isProcessedExternally: z.boolean().optional(),
    paymentAdditionalData: z
        .object({
            type: z.string().min(1, 'Тип дополнительных данных обязателен'),
        })
        .optional(),
    isFiscalizedExternally: z.boolean().optional(),
    isPrepay: z.boolean().optional(),
});

export const banquetOrderDataSchema = z.object({
    menuId: z.string().optional(),
    items: z.array(banquetOrderItemSchema).nonempty('Список товаров обязателен'),
    combos: z
        .array(
            z.object({
                id: z.string().min(1, 'ID комбо обязательно'),
                name: z.string().min(1, 'Название комбо обязательно'),
                amount: z.number().min(1, 'Количество комбо обязательно'),
                price: z.number().min(1, 'Цена комбо обязательна'),
                sourceId: z.string().min(1, 'Source ID обязателен'),
                programId: z.string().optional(),
                sizeId: z.string().optional(),
            })
        )
        .optional(),
    payments: z.array(orderPaymentSchema).optional(),
    tips: z
        .array(
            z.object({
                number: z.number().optional(),
                paymentTypeKind: z.enum(['Cash', 'Card', 'External']),
                tipsTypeId: z.string().min(1, 'ID типа чаевых обязателен'),
                sum: z.number().min(0, 'Сумма чаевых обязательна'),
                paymentTypeId: z.string().min(1, 'ID типа платежа обязателен'),
                isProcessedExternally: z.boolean(),
                paymentAdditionalData: z
                    .object({
                        type: z.string().min(1, 'Тип дополнительных данных обязателен'),
                    })
                    .optional(),
                isFiscalizedExternally: z.boolean(),
                isPrepay: z.boolean(),
            })
        )
        .optional(),
    sourceKey: z.string().optional(),
    discountsInfo: z
        .object({
            card: z
                .object({
                    track: z.string().min(1, 'Трек карты обязателен'),
                })
                .optional(),
            discounts: z
                .array(
                    z.object({
                        type: z.string().min(1, 'Тип скидки обязателен'),
                    })
                )
                .optional(),
        })
        .optional(),
    loyaltyInfo: z
        .object({
            coupon: z.string().min(1, 'Купон обязателен'),
            applicableManualConditions: z
                .array(z.string().min(1, 'Условия обязательны'))
                .nonempty(),
        })
        .optional(),
    orderTypeId: z.string().optional(),
    chequeAdditionalInfo: z
        .object({
            needReceipt: z.boolean().refine(val => val, 'Поле обязательно'),
            email: z.string().email('Некорректный email').optional(),
            settlementPlace: z.string().optional(),
            phone: z.string().optional(),
        })
        .optional(),
    externalData: z
        .array(
            z.object({
                key: z.string().min(1, 'Ключ обязателен'),
                value: z.string().min(1, 'Значение обязательно'),
                isPublic: z.boolean().refine(val => val !== undefined, 'Поле обязательно'),
            })
        )
        .optional(),
});

export const schema = z.object({
    organizationId: z.string().min(1, 'Организация обязательна'),
    terminalGroupId: z.string().optional(),
    id: z.string().optional(),
    externalNumber: z.string().optional(),
    order: banquetOrderDataSchema.optional(),
    customer: z.object({
        name: z.string().min(1, 'Имя заказчика обязательно').max(60, 'Максимальная длина 60 символов'),
        type: z.enum(['one-time']).refine(val => val === 'one-time', 'Тип заказчика обязателен'),
    }),
    phone: z
        .string()
        .regex(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/, 'Некорректный формат номера')
        .min(1, 'Номер телефона обязателен'),
    comment: z.string().optional(),
    durationInMinutes: z
        .number()
        .min(30, 'Минимальная длительность 30 минут'),
    shouldRemind: z.boolean(),
    tableIds: z.array(z.string()).nonempty('Необходимо выбрать столы'),
    estimatedStartTime: z.string().min(1, 'Дата и время обязательны'),
    guests: z
        .object({
            count: z.number().min(1, 'Количество гостей обязательно').optional(),
        })
        .optional(),
    eventType: z.string().optional(),
});
