import { IStore } from 'pages/store/[id]'

export const getStoreResult = (store): IStore => {
    return {
        id: store?.id,
        title: store?.attributes?.title || '',
        description: store?.attributes?.description || '',
        payment_system: {
            id: store?.attributes?.payment_system?.data?.id,
            ...store?.attributes?.payment_system?.data?.attributes || {}
        },
        image: store?.attributes?.image?.data?.attributes?.url || '',
        preview_size: store?.attributes?.preview_size || 'min',
        category: {
            id: store?.attributes?.category?.data?.id || 0,
            name: store?.attributes?.category?.data?.attributes?.name || '',
        },
        products: store?.attributes?.products?.data ? store?.attributes?.products?.data?.map(p => ({
            id: p.id,
            name: p.attributes?.name || 'Без имени',
            description: p.attributes?.description || '',
            price: p.attributes?.price || 0,
            for_sale: p.attributes?.for_sale || false,
            memo_text: p.attributes?.memo_text || '',
            warning_text: p.attributes?.warning_text || '',
            image: p.attributes?.image?.data.attributes.url || '',
        })) : [],
        storeType: {
            label: store?.attributes.store_type?.data?.attributes.label || '',
            value: store?.attributes.store_type?.data?.attributes.value || '',
        },
        storeWorktime: store?.attributes.store_worktime?.length > 0 ? store.attributes.store_worktime?.map(p => ({
            id: p.id,
            start: p.start || '',
            end: p.end || '',
            weekday: {
                day: p.weekday.data.attributes.day || '',
                name: p.weekday.data.attributes.name || '',
            }
        })) : [],
        fee: {
            name: store?.attributes.fee?.name || '',
            description: store?.attributes.fee?.description || '',
            type: store?.attributes.fee?.type || 'fix',
            value: store?.attributes.fee?.value || 0,
        },
        customId: store?.attributes?.customId || '',
        isActive: store?.attributes?.isActive || false,
        isCustom: store?.attributes?.isCustom || false,
    }
}