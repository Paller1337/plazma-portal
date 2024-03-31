export interface IiikoToken {
    correlationId: string
    token: string
}

export interface IOrganization {
    correlationId: string
    organizations: {
        responseType: string,
        id: string
        name: string,
        code: string,
        externalData: {
            key: string,
            value: string
        }[]
    }[]
}

export interface IIkoMenus {
    correlationId: string
    externalMenus: {
        id: string
        name: string
    }[]
    priceCategories: {
        id: string
        name: string
    }[]

}



interface ItemSize {
    sku: string;
    sizeCode: string | null;
    sizeName: string | null;
    isDefault: boolean;
    portionWeightGrams: number;
    itemModifierGroups: any[];
    sizeId: string | null;
    nutritionPerHundredGrams: NutritionPerHundredGrams;
    prices: Price[];
    nutritions: Nutrition[];
    measureUnitType: string;
    buttonImageCroppedUrl: ButtonImageCroppedUrl | null;
    buttonImageUrl: string | null;
}

interface NutritionPerHundredGrams {
    fats: number;
    proteins: number;
    carbs: number;
    energy: number;
    organizations: string[];
}

interface Price {
    organizationId: string;
    price: number | null;
}

interface Nutrition {
    fats: number;
    proteins: number;
    carbs: number;
    energy: number;
    organizations: string[];
}

interface ButtonImageCroppedUrl {
    "475x250": ImageInfo;
    "475x250-webp": ImageInfo;
}

interface ImageInfo {
    url: string;
    hash: string;
    cropped: any;
}

export interface IikoMenuItem {
    sku: string;
    name: string;
    description: string;
    allergens: Allergen[];
    tags: any[];
    labels: any[];
    itemSizes: ItemSize[];
    itemId: string;
    modifierSchemaId: string | null;
    taxCategory: string | null;
    modifierSchemaName: string | null;
    canBeDivided: boolean;
    canSetOpenPrice: boolean;
    useBalanceForSell: boolean;
    measureUnit: string;
    productCategoryId: string | null;
    customerTagGroups: any[];
    paymentSubject: string;
    outerEanCode: string | null;
    orderItemType: string;
}

interface Allergen {
    id: string;
    code: string;
    name: string;
}

interface ItemCategory {
    id: string;
    name: string;
    description: string;
    buttonImageUrl: string | null;
    headerImageUrl: string | null;
    iikoGroupId: string | null;
    items: IikoMenuItem[];
}

interface ProductCategory {
    name: string;
    id: string;
    isDeleted: boolean;
}

interface CustomerTagGroup {
    // добавьте сюда необходимые поля, если они есть в вашем JSON объекте
}

export interface IikoMenu {
    productCategories: ProductCategory[]
    customerTagGroups: CustomerTagGroup[]
    id: number;
    name: string;
    description: string;
    itemCategories: ItemCategory[]
    comboCategories: any[]
}
