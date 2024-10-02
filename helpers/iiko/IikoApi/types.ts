// src/types.ts

/** Ответ на авторизацию */
export interface AuthResponse {
    /** Токен доступа */
    token: string;
}

/** Организация */
export interface OrganizationResponse {
    correlationId: string
    organizations: Organization[]
}

export interface Organization {
    /** Уникальный идентификатор организации */
    id: string;
    /** Название организации */
    name: string;
    /** Код организации */
    code?: string;
    /** Адрес ресторана */
    restaurantAddress?: string;
    /** Статус организации */
    status?: 'Active' | 'Closed';
    /** Страна */
    country?: string;
    /** Часовой пояс */
    timeZone?: string;
    /** Валюта */
    currencyIsoName?: string;
    /** Географическая широта */
    latitude?: number;
    /** Географическая долгота */
    longitude?: number;
    /** Признак демонстрационной организации */
    demo?: boolean;
    /** Идентификатор родительской организации */
    parentOrganizationId?: string;
    /** Контактная информация */
    contact?: string;
    /** Дополнительная информация */
    additionalInfo?: string;
    /** Версия iikoFront */
    iikoVersion?: string;
}

/** Ответ на запрос терминальных групп */
export interface TerminalGroupsResponse {
    correlationId: string
    terminalGroups: TerminalGroup[]
    terminalGroupsInSleep: TerminalGroup[]
}

export interface TerminalGroup {
    organizationId: string
    items: Terminal[]
}

/** Терминальная группа */
interface Terminal {
    /** Уникальный идентификатор терминальной группы */
    id: string;
    /** Идентификатор организации */
    organizationId: string;
    /** Название терминальной группы */
    name: string;
    /** Адрес */
    address?: string;
    /** Признак удаления */
    timeZone?: string;
    /** Внешняя ревизия */
    externalData?: any;
}

/** Продукт меню */
interface Product {
    /** Уникальный идентификатор продукта */
    id: string;
    /** Код продукта */
    code?: string;
    /** Название продукта */
    name: string;
    /** Идентификатор группы */
    groupId?: string;
    /** Тип продукта */
    type: 'Dish' | 'Good' | 'Modifier';
    /** Тип позиции заказа */
    orderItemType?: 'Product' | 'Compound' | 'Service';
    /** Описание продукта */
    description?: string;
    /** Дополнительная информация */
    additionalInfo?: string;
    /** Жиры */
    fatAmount?: number;
    /** Белки */
    proteinsAmount?: number;
    /** Углеводы */
    carbohydratesAmount?: number;
    /** Энергетическая ценность */
    energyAmount?: number;
    /** Полная энергетическая ценность */
    energyFullAmount?: number;
    /** Полное количество жиров */
    fatFullAmount?: number;
    /** Полное количество белков */
    proteinsFullAmount?: number;
    /** Полное количество углеводов */
    carbohydratesFullAmount?: number;
    /** Вес */
    weight?: number;
    /** Единица измерения */
    measureUnit?: string;
    /** Размеры и цены */
    sizePrices?: SizePrice[];
    /** Модификаторы */
    modifiers?: Modifier[];
    /** Групповые модификаторы */
    groupModifiers?: GroupModifier[];
    /** Ссылки на изображения */
    imageLinks?: string[];
    /** Признак удаления */
    isDeleted: boolean;
    /** Не печатать в чеке */
    doNotPrintInCheque?: boolean;
    /** Порядок отображения */
    order?: number;
}

/** Цена для размера */
interface SizePrice {
    /** Идентификатор размера */
    sizeId: string;
    /** Название размера */
    sizeName: string;
    /** Цена */
    price: number;
}

/** Модификатор */
interface Modifier {
    /** Уникальный идентификатор модификатора */
    id: string;
    /** Количество по умолчанию */
    defaultAmount: number;
    /** Скрывать, если количество по умолчанию */
    hideIfDefaultAmount: boolean;
    /** Минимальное количество */
    minAmount: number;
    /** Максимальное количество */
    maxAmount: number;
    /** Обязательный модификатор */
    required: boolean;
    /** Делится между гостями */
    splitBetweenGuests: boolean;
    /** Пропорция */
    proportion?: number;
    /** Тип изменения цены */
    priceModificationType?: 'Percent' | 'Fixed';
    /** Изменение цены */
    priceModification?: number;
    /** Идентификатор модификатора */
    modifierId: string;
}

/** Групповой модификатор */
interface GroupModifier {
    /** Уникальный идентификатор группового модификатора */
    id: string;
    /** Количество по умолчанию */
    defaultAmount: number;
    /** Скрывать, если количество по умолчанию */
    hideIfDefaultAmount: boolean;
    /** Минимальное количество */
    minAmount: number;
    /** Максимальное количество */
    maxAmount: number;
    /** Обязательный модификатор */
    required: boolean;
    /** Дочерние модификаторы */
    childModifiers: ChildModifier[];
    /** Идентификатор группы */
    modifierId: string;
}

/** Дочерний модификатор */
interface ChildModifier {
    /** Идентификатор модификатора */
    modifierId: string;
    /** Количество по умолчанию */
    defaultAmount: number;
    /** Минимальное количество */
    minAmount: number;
    /** Максимальное количество */
    maxAmount: number;
    /** Цена задана вручную */
    pricePredefined?: boolean;
}

/** Группа меню */
interface MenuGroup {
    /** Уникальный идентификатор группы */
    id: string;
    /** Код группы */
    code?: string;
    /** Название группы */
    name: string;
    /** Описание группы */
    description?: string;
    /** Дополнительная информация */
    additionalInfo?: string;
    /** Признак удаления */
    isDeleted: boolean;
    /** Родительская группа */
    parentGroup?: string;
    /** Ссылки на изображения */
    imageLinks?: string[];
    /** Порядок отображения */
    order?: number;
}

/** Ответ на запрос меню */
export interface NomenclatureResponse {  /** TODO Актуализировать типы */
    /** Группы меню */
    groups: MenuGroup[];
    /** Продукты меню */
    products: Product[];
    /** Ревизия */
    revision: number;
}


/** Тип оплаты */
export interface PaymentType {
    /** Уникальный идентификатор типа оплаты */
    id: string;
    /** Код типа оплаты */
    code: string;
    /** Название типа оплаты */
    name: string;
    /** Комментарий типа оплаты */
    comment: string;
    combinable: boolean
    externalRevision: number
    applicableMarketingCampaigns: string[]
    printCheque: boolean

    /** Вид оплаты */
    paymentTypeKind: "Unknown" | "Cash" | "Card" | "Credit" | "Writeoff" | "Voucher" | "External" | "SmartSale" | "Sberbank" | "Trpos"
    /** Код оплаты */
    paymentProcessingType: 'None' | 'External' | 'Internal';
    /** Признак удаления */
    isDeleted: boolean;
    terminalGroups: {
        id: string
        organizationId: string
        name: string
        timeZone: string
        externalData: {
            key: string
            value: string
        }[]
    }
}


/** Тип скидки */
export interface DiscountType {
    /** Уникальный идентификатор скидки */
    id: string;
    /** Название скидки */
    name: string;
    /** Сумма скидки */
    sum: number;
    /** Процент скидки */
    percent: number;
    /** Признак удаления */
    isDeleted: boolean;
    /** Идентификатор организации */
    organizationId: string;
}



/** Запрос для получения меню (API v2) */
export interface MenusV2Request { }
export interface MenusV2Response {
    correlationId: string,
    externalMenus: {
        id: string,
        name: string
    }[]
    priceCategories: {
        id: string,
        name: string
    }[]
}


export interface MenuV2ByIdRequest {
    externalMenuId: string,
    organizationIds: string[],
    priceCategoryId?: string,
    version?: number,
    language?: string,
    asyncMode?: false,
    startRevision?: number
}

/** Ответ на запрос меню (API v2) */
export interface MenuV2ByIdResponse {
    /** Ревизия */
    revision: number
    /** ID меню */
    id: string
    /** Название меню */
    name: string
    /** Описание меню */
    description: string
    /** Категории */
    itemCategories: ItemCategory[]
    productCategories: ProductCategory[]
    comboCategories: []

    buttonImageUrl: string,
    intervals: any[]

    customerTagGroups: any[],
}


/** Категория меню (API v2) */
interface ProductCategory {
    /** Уникальный идентификатор группы */
    id: string;
    /** Название группы */
    name: string;
    /** Признак удаления */
    isDeleted: boolean;

    percentage: any
}

/** Категория блюда (API v2) */
interface ItemCategory {
    /** Уникальный идентификатор категории */
    id: string;
    /** Название категории */
    name: string;
    /** Описание категории */
    description: string

    buttonImageUrl: string,
    headerImageUrl: string,
    iikoGroupId: string,
    items: ItemMenuV2[],
    scheduleId: any,
    scheduleName: any,
    schedules: any[],

    /** Признак отображения */
    isHidden: boolean
}

export interface ItemMenuV2 {
    sku: number,
    name: string,
    description: string,
    allergens: [],
    tags: [],
    labels: [],
    itemSizes: {
        sku: number,
        sizeCode: string,
        sizeName: string,
        isDefault: boolean,
        portionWeightGrams: number,
        itemModifierGroups: any[],
        sizeId: string,
        nutritionPerHundredGrams: {
            fats: number,
            proteins: number,
            carbs: number,
            energy: number,
            organizations: any[],
            saturatedFattyAcid: any,
            salt: any,
            sugar: any
        },
        prices: {
            organizationId: string
            price: number
        }[]
        nutritions: {
            fats: number,
            proteins: number,
            carbs: number,
            energy: number,
            organizations: string[]
            saturatedFattyAcid: any,
            salt: any,
            sugar: any
        }[]
        measureUnitType: "GRAM",
        buttonImageCroppedUrl: string,
        buttonImageUrl: string
    }[],
    itemId: string,
    modifierSchemaId: string,
    taxCategory: any,
    modifierSchemaName: string,
    type: any, //
    canBeDivided: boolean,
    canSetOpenPrice: boolean,
    useBalanceForSell: boolean,
    measureUnit: string,
    productCategoryId: string,
    customerTagGroups: any[],
    paymentSubject: any,  //
    outerEanCode: any,
    isHidden: boolean,
    orderItemType: any  //
}

/** Информация об изображении */
interface ImageInfo {
    /** URL изображения */
    imageUrl: string;
    /** Тип изображения */
    imageType?: string;
}

/** Модификатор (API v2) */
interface ModifierV2 {
    /** Уникальный идентификатор модификатора */
    id: string;
    /** Название модификатора */
    name: string;
    /** Цена модификатора */
    price: number;
    /** Обязательный модификатор */
    required: boolean;
    /** Минимальное количество */
    minAmount: number;
    /** Максимальное количество */
    maxAmount: number;
}

/** Групповой модификатор (API v2) */
interface GroupModifierV2 {
    /** Уникальный идентификатор группового модификатора */
    id: string;
    /** Название группового модификатора */
    name: string;
    /** Обязательный модификатор */
    required: boolean;
    /** Минимальное количество */
    minAmount: number;
    /** Максимальное количество */
    maxAmount: number;
    /** Модификаторы внутри группы */
    childModifiers: ModifierV2[];
}

/** Цена для размера (API v2) */
interface SizePriceV2 {
    /** Идентификатор размера */
    sizeId: string;
    /** Название размера */
    sizeName: string;
    /** Цена */
    price: number;
}

/** Размер продукта */
interface ProductSize {
    /** Уникальный идентификатор размера */
    id: string;
    /** Название размера */
    name: string;
}

/** Упаковка */
interface Packaging {
    /** Уникальный идентификатор упаковки */
    id: string;
    /** Название упаковки */
    name: string;
    /** Цена упаковки */
    price: number;
}

/** Категория */
interface Category {
    /** Уникальный идентификатор категории */
    id: string;
    /** Название категории */
    name: string;
}

/** Аллерген */
interface Allergen {
    /** Уникальный идентификатор аллергена */
    id: string;
    /** Название аллергена */
    name: string;
}

/** Пищевая информация */
interface NutritionalInfo {
    /** Идентификатор продукта */
    productId: string;
    /** Калории */
    calories?: number;
    /** Белки */
    proteins?: number;
    /** Жиры */
    fats?: number;
    /** Углеводы */
    carbohydrates?: number;
}

interface RestaurantTable {
    id: string,
    number: 0,
    name: string
    seatingCapacity: 0,
    revision: 0,
    isDeleted: true,
    posId: string
}

export interface RestaurantSection {
    id: string,
    terminalGroupId: string,
    name: string,
    tables: RestaurantTable[]
    schema: {
        width: 0,
        height: 0,
        markElements: {
            text: string
            font: {
                fontFamily: string,
                size: number,
                fontStyle: string
            },
            "color": {
                "a": 0,
                "r": 0,
                "g": 0,
                "b": 0
            },
            "x": 0,
            "y": 0,
            "z": 0,
            "angle": 0,
            "width": 0,
            "height": 0
        }[]
        tableElements: {
            tableId: string,
            "x": 0,
            "y": 0,
            "z": 0,
            "angle": 0,
            "width": 0,
            "height": 0
        }[]
        rectangleElements: {
            "color": {
                "a": 0,
                "r": 0,
                "g": 0,
                "b": 0
            },
            "x": 0,
            "y": 0,
            "z": 0,
            "angle": 0,
            "width": 0,
            "height": 0
        }[]
        ellipseElements: {
            color: {
                "a": 0,
                "r": 0,
                "g": 0,
                "b": 0
            },
            "x": 0,
            "y": 0,
            "z": 0,
            "angle": 0,
            "width": 0,
            "height": 0
        }[],
        revision: number,
        isDeleted: boolean
    }
}

export interface AvailableRestaurantSectionsResponse {
    correlationId: string,
    restaurantSections: RestaurantSection[],
    revision: 0
}


interface RestaurantReserve {
    id: string
    tableIds: string[]
    estimatedStartTime: string //"2019-08-24 14:15:22.123"
    durationInMinutes: number
    guestsCount: number
}

export interface RestaurantSectionsWorkloadResponse {
    correlationId: string,
    reserves: RestaurantReserve[]
}



export interface IBanquet {
    correlationId: string
    reserves:
    {
        id: string
        tableIds: string[]
        estimatedStartTime: string
        durationInMinutes: number
        guestsCount: number
    }[]
}

export interface ReserveCreateRequest {
    organizationId: string,
    terminalGroupId?: string,
    id?: string,
    externalNumber?: string,

    order?: IBanquetOrderData,
    customer: {
        name: string,
        type: 'one-time',
    },

    phone: string,
    comment: string,

    durationInMinutes: number,
    shouldRemind: boolean,

    tableIds: string[],
    estimatedStartTime: string,
    guests?: {
        count: number
    },
    eventType?: string
}


export interface IBanquetOrderData {
    menuId?: string,
    items: IBanquetOrderItem[]
    combos?: {
        id: string
        name: string,
        amount: number,
        price: number,
        sourceId: string
        programId?: string
        sizeId?: string
    }[]
    payments?: IOrderPayment[]
    tips?: {
        /** Номер карты если в paymentTypeKind выбран тип Card */
        number?: number,
        paymentTypeKind: 'Cash' | 'Card' | 'External',
        tipsTypeId: string,
        sum: 0,
        paymentTypeId: string,
        isProcessedExternally: boolean,
        paymentAdditionalData: {
            type: string
        },
        isFiscalizedExternally: boolean,
        isPrepay: boolean
    }[]
    sourceKey?: string,
    discountsInfo?: {
        card?: {
            track: string
        },
        discounts?: { //Можно добавить скидки на отдельные позиции
            type: string
        }[]
    },
    loyaltyInfo?: {
        coupon: string,
        applicableManualConditions: string[]
    },
    orderTypeId?: string,
    chequeAdditionalInfo?: {
        needReceipt: boolean,
        email?: string,
        settlementPlace?: string,
        phone?: string
    },
    externalData?: {
        key: string,
        value: string,
        isPublic: boolean
    }[]
}

export interface IOrderPayment {
    /** Номер карты если в paymentTypeKind выбран тип Card */
    number?: number,
    paymentTypeKind: string,
    sum: number,
    paymentTypeId: string,
    isProcessedExternally?: boolean,
    paymentAdditionalData?: {
        type: string
    },
    isFiscalizedExternally?: boolean,
    isPrepay?: boolean
}
export interface IBanquetOrderItem {
    productId: string,
    modifiers?: {
        productId: string
        amount: number
        productGroupId?: string
        price?: number
        positionId?: string
    }[]
    price: string,
    positionId?: string,
    type: 'Product' | 'Compound',
    amount: number,
    productSizeId?: string,
    comboInformation?: {
        comboId?: string,
        comboSourceId?: string,
        comboGroupId?: string
    },
    comment?: string
}

export interface ReserveCreateResponse {
    correlationId: string,
    reserveInfo: {
        id: string
        externalNumber: string
        organizationId: string
        timestamp: string
        creationStatus: string
        errorInfo: {
            code: any,
            message: string,
            description: string,
            additionalData: any
        },
        isDeleted: boolean,
        reserve: {
            customer: any,
            guestsCount: number,
            comment: string,
            durationInMinutes: number,
            shouldRemind: boolean,
            status: "New" | "Started" | "Closed",
            cancelReason: "ClientNotAppeared" | "ClientRefused" | "Other",
            tableIds: string[],
            estimatedStartTime: string //"2019-08-24 14:15:22.123",
            guestsComingTime: string //"2019-08-24 14:15:22.123",
            phone: string
            eventType: string
            order: {
                menuId: string
                sum: number
                number: number
                sourceKey: string
                whenBillPrinted: string //"2019-08-24 14:15:22.123",
                whenClosed: string //"2019-08-24 14:15:22.123",
                conception: {
                    id: string
                    name: string,
                    code: string
                },
                guestsInfo: {
                    count: number,
                    splitBetweenPersons: boolean
                },
                items: {
                    type: string,
                    status: "Added" | "PrintedNotCooking" | "CookingStarted" | "CookingCompleted" | "Served"
                    deleted: {
                        deletionMethod: {
                            id: string
                            comment: string
                            removalType: {
                                id: string
                                name: string
                            }
                        }
                    },
                    amount: number
                    comment: string
                    whenPrinted: string // "2019-08-24 14:15:22.123",
                    size: {
                        id: string
                        name: string
                    },
                    comboInformation: {
                        comboId: string
                        comboSourceId: string
                        groupId: string
                    }
                }[]
                combos: {
                    id: string
                    name: string
                    amount: number
                    price: number
                    sourceId: string
                    size: {
                        id: string
                        name: string
                    }
                }[]
                payments: {
                    paymentType: {
                        id: string
                        name: string
                        kind: "Unknown" | "Cash" | "Card" | "Credit" | "Writeoff" | "Voucher" | "External" | "SmartSale" | "Sberbank" | "Trpos"
                    },
                    sum: number,
                    isPreliminary: boolean
                    isExternal: boolean
                    isProcessedExternally: boolean
                    isFiscalizedExternally: boolean
                    isPrepa: boolean
                }[]
                tips: {
                    tipsType: {
                        id: string
                        name: string
                    },
                    paymentType: {
                        id: string
                        name: string
                        kind: "Unknown" | "Cash" | "Card" | "Credit" | "Writeoff" | "Voucher" | "External" | "SmartSale" | "Sberbank" | "Trpos"
                    },
                    sum: number,
                    isPreliminary: boolean
                    isExternal: boolean
                    isProcessedExternally: boolean
                    isFiscalizedExternally: boolean
                    isPrepay: boolean
                }[]
                discounts: {
                    discountType: {
                        id: string
                        name: string
                    },
                    sum: number,
                    selectivePositions: string[]
                    selectivePositionsWithSum: {
                        positionId: string
                        sum: number
                    }[]
                }[]
                orderType: {
                    id: string
                    name: string
                    orderServiceType: "Common" | "DeliveryByCourier" | "DeliveryByClient"
                },
                terminalGroupId: string
                processedPaymentsSum: number,
                loyaltyInfo: {
                    coupon: string,
                    appliedManualConditions: string[]
                },
                externalData: {
                    "key": "string",
                    "value": "string"
                }[]
            }
        }
    }
}

export interface ReserveStatusByIdResponse {
    correlationId: string
    reserves: Reserve[]
}

export interface Reserve {
    id: string,
    externalNumber: string,
    organizationId: string,
    timestamp: number,
    creationStatus: string
    errorInfo: {
        code: any,
        message: string,
        description: string,
        additionalData: any
    },
    isDeleted: true,
    reserve: {
        customer: any,
        guestsCount: number,
        comment: string,
        durationInMinutes: number,
        shouldRemind: boolean,
        status: "New" | "Started" | "Closed",
        cancelReason: "ClientNotAppeared" | "ClientRefused" | "Other",
        tableIds: string[],
        estimatedStartTime: string //"2019-08-24 14:15:22.123",
        guestsComingTime: string  //"2019-08-24 14:15:22.123",
        phone: string,
        eventType: string,
        order: {
            menuId: string
            sum: number
            number: number
            sourceKey: string
            whenBillPrinted: string //"2019-08-24 14:15:22.123",
            whenClosed: string //"2019-08-24 14:15:22.123",
            conception: {
                id: string
                name: string,
                code: string
            },
            guestsInfo: {
                count: number,
                splitBetweenPersons: boolean
            },
            items: ReserveProductItem[]
            combos: {
                id: string
                name: string
                amount: number
                price: number
                sourceId: string
                size: {
                    id: string
                    name: string
                }
            }[]
            payments: {
                paymentType: {
                    id: string
                    name: string
                    kind: "Unknown" | "Cash" | "Card" | "Credit" | "Writeoff" | "Voucher" | "External" | "SmartSale" | "Sberbank" | "Trpos"
                },
                sum: number,
                isPreliminary: boolean
                isExternal: boolean
                isProcessedExternally: boolean
                isFiscalizedExternally: boolean
                isPrepa: boolean
            }[]
            tips?: {
                /** Номер карты если в paymentTypeKind выбран тип Card */
                number?: number,
                paymentTypeKind: 'Cash' | 'Card' | 'External',
                tipsTypeId: string,
                sum: 0,
                paymentTypeId: string,
                isProcessedExternally: boolean,
                paymentAdditionalData: {
                    type: string
                },
                isFiscalizedExternally: boolean,
                isPrepay: boolean
            }[]
            discounts: {
                discountType: {
                    id: string
                    name: string
                },
                sum: number,
                selectivePositions: string[]
                selectivePositionsWithSum: {
                    positionId: string
                    sum: number
                }[]
            }[]
            orderType: {
                id: string
                name: string
                orderServiceType: "Common" | "DeliveryByCourier" | "DeliveryByClient"
            },
            terminalGroupId: string,
            processedPaymentsSum: number,
            loyaltyInfo: {
                coupon: string,
                appliedManualConditions: string[]
            },
            externalData: {
                key: string
                value: string
            }[]
        }
    }
}

export interface ReserveProductItem {
    type: string,
    status: "Added" | "PrintedNotCooking" | "CookingStarted" | "CookingCompleted" | "Served"
    deleted: {
        deletionMethod: {
            id: string
            comment: string
            removalType: {
                id: string
                name: string
            }
        }
    },
    amount: number
    comment: string
    whenPrinted: string // "2019-08-24 14:15:22.123",
    size: {
        id: string
        name: string
    },
    comboInformation: {
        comboId: string
        comboSourceId: string
        groupId: string
    }


    product: {
        id: string
        name: string
    }
    modifiers?: {
        productId: string,
        amount: number,
        productGroupId?: string,
        price?: number,
        positionId?: string,
    }[]
    price: string
    cost: string
    pricePredefined: boolean
    positionId?: string,
    productSizeId?: string,
    resultSum: number
}

export interface CommandStatusResponse {
    exception?: any,
    state: any
}
