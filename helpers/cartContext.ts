import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { DEFAULTS } from 'defaults'
import { axiosInstance } from './axiosInstance'
import { IProduct } from 'types/order'
import * as iiko from '../helpers/iiko/iikoExternalClientApi'
import { MenusV2Response, MenuV2ByIdResponse, NomenclatureResponse } from './iiko/IikoApi/types'




export const findItemInCache = (itemId, menuCached: { [key: string]: MenuV2ByIdResponse }) => {
    if (menuCached) {
        for (const menuId in menuCached) {
            const menu = menuCached[menuId];

            // Ищем item с нужным id в массиве items текущего меню
            const foundCat = menu.itemCategories.find(cat => cat.items.find(item => item.itemId === itemId))
            const foundItem = foundCat?.items?.find(item => item.itemId === itemId)

            if (foundItem) {
                return foundItem; // Возвращаем найденный item
            }
        }

        // Если не нашли, возвращаем null или сообщение
        return null;
    }
}

export const findItemInNomenclature = (itemId, nomenclature: NomenclatureResponse) => {
    if (nomenclature) {
        const foundItem = nomenclature?.products?.find(item => item.id === itemId)
        if (foundItem) {
            return foundItem; // Возвращаем найденный item
        }
        // Если не нашли, возвращаем null или сообщение
        return null;
    }
}

export const getStoreById = async (id: number) => {
    try {
        // const store = await axios.get(`${DEFAULTS.STRAPI.url}/api/stores/${id}`, {
        //     params: {
        //         'populate': 'deep,3',
        //     }
        // })

        const store = await axiosInstance.get(`/api/store/${id}`)
        // console.log('store: ', { store })
        return {
            id,
            title: store.data.data.attributes.title || '',
            description: store.data.data.attributes.description || '',
            imageUrl: store.data.data.attributes.image?.data?.attributes?.url || '',
            category: store.data.data.attributes.category?.data?.id || 0,
            store_type: {
                id: store.data.data.attributes.store_type.data.id || '',
                label: store.data.data.attributes.store_type.data.attributes.label || '',
                value: store.data.data.attributes.store_type.data.attributes.value || '',
            },
            isCustom: store.data.data.attributes?.isCustom || false,
            customId: store.data.data.attributes?.customId || null
        }
    } catch (error) {
        console.error('Error fetching store data:', error);
        return null;
    }
}


export const getStoreByCustomId = async (id: string) => {
    try {
        // const store = await axios.get(`${DEFAULTS.STRAPI.url}/api/stores/${id}`, {
        //     params: {
        //         'populate': 'deep,3',
        //     }
        // })

        // const store = await axiosInstance.get(`/api/store/custom/${id}`)

        const storeData = (await axiosInstance.get(`/api/store/custom/${id}`)).data
        const store = storeData.data.length > 0 ? storeData.data[0] : null
        return {
            id: store?.id || 'not-found',
            title: store?.attributes?.title || '',
            description: store?.attributes?.description || '',
            imageUrl: store?.attributes?.image?.data?.attributes?.url || '',
            category: store?.attributes?.category?.data?.id || 0,
            store_type: {
                id: store?.attributes.store_type?.data?.id || '',
                label: store?.attributes.store_type?.data?.attributes?.label || '',
                value: store?.attributes.store_type?.data?.attributes?.value || '',
            },
            isCustom: store?.attributes?.isCustom || false,
            customId: store?.attributes?.customId || null
        }
    } catch (error) {
        console.error('Error fetching store data:', error);
        return null;
    }
}

export const getProductById = async (id: number) => {
    try {
        const product = await axiosInstance.get(`/api/store/product/${id}`)

        const productData = product.data.data.attributes
        return {
            id: id.toString(),
            name: productData.name || 'Без имени',
            memo_text: productData.memo_text || '',
            description: productData.description || '',
            for_sale: productData.for_sale || false,
            warning_text: productData.warning_text || '',
            image: productData.image?.data?.attributes?.url || '',
            price: productData.price || 0,
            store: {
                id: productData.store?.data?.id || 0,
            },
        } as IProduct
    } catch (error) {
        console.error('Error fetching product data:', error);
        return null;
    }
}


export const getIikoProductById = async (id, cache: { [key: string]: MenuV2ByIdResponse }) => {
    try {
        // const product = await axiosInstance.get(`/api/store/product/${id}`)
        const productData = findItemInCache(id, cache)
        return {
            id: id.toString(),
            name: productData?.name || 'Без имени',
            memo_text: '',
            description: productData?.description || '',
            for_sale: true,
            warning_text: '',
            image: productData?.itemSizes[0]?.buttonImageUrl || '',
            price: productData?.itemSizes[0]?.prices[0]?.price || 0,
            store: {
                isCustom: true,
                customId: 'eat'
            },
        } as IProduct
    } catch (error) {
        console.error('Error fetching product data:', error);
        return null;
    }
}


function useIikoMenu() {
    const [iikoMenuIsFetched, setIikoMenuIsFetched] = useState(false);
    const [menus, setMenus] = useState<{ [key: string]: MenuV2ByIdResponse }>({});
    const [menusV2, setMenusV2] = useState<MenusV2Response>(null);
    const [orgId, setOrgId] = useState<string>('');
    const [isFetchingMenus, setIsFetchingMenus] = useState(false)
    const [nomenclature, setNomenclature] = useState<NomenclatureResponse>(null)

    // Функция для загрузки меню по ID с проверкой кеша
    const fetchIikoMenu = async (menuId: string) => {
        if (menus[menuId]) {
            // Меню уже в кеше
            return menus[menuId];
        }

        try {
            const menu = await iiko.fetchMenuByIdV2({
                externalMenuId: menuId,
                organizationIds: [orgId],
            });
            // Обновляем кеш
            setMenus((prevMenus) => ({
                ...prevMenus,
                [menuId]: menu,
            }));
            return menu;
        } catch (error) {
            console.error(`Ошибка при загрузке меню с ID ${menuId}:`, error);
        }
    };

    // 1. Получение orgId при монтировании компонента
    useEffect(() => {
        const initOrg = async () => {
            try {
                const response = await iiko.fetchOrganizations();
                const id = response.organizations[0].id;
                setOrgId(id);
            } catch (error) {
                console.error('Ошибка при получении orgId:', error);
            }
        };

        initOrg();
    }, []); // Пустой массив зависимостей - эффект выполняется один раз

    // 1.1. Получение nomen при монтировании компонента
    useEffect(() => {
        if (orgId && !nomenclature) {
            const initNomen = async () => {
                try {
                    const response = await iiko.fetchNomenclature({ organizationId: orgId })
                    setNomenclature(response);
                } catch (error) {
                    console.error('Ошибка при получении nomenclature:', error);
                }
            };

            initNomen()
        }
    }, [orgId]); // Пустой массив зависимостей - эффект выполняется один раз

    // 2. Получение menusV2 после получения orgId
    useEffect(() => {
        if (orgId && !menusV2) {
            const initMenusV2 = async () => {
                try {
                    const response = await iiko.fetchMenusV2();
                    setMenusV2(response);
                    console.log(`%c Получение menusV2:`, 'color:white;background-color:orange;')
                    console.log({ data: response.externalMenus })
                    const uploadMenuData = await axiosInstance.post('/api/iiko/external-menu', response.externalMenus)
                } catch (error) {
                    console.error('Ошибка при получении menusV2:', error);
                }
            };

            initMenusV2();
        }
    }, [orgId]); // Зависимость только от orgId

    // 3. Загрузка всех меню после получения menusV2
    useEffect(() => {
        if (orgId && menusV2 && !iikoMenuIsFetched && !isFetchingMenus) {
            const fetchAllMenus = async () => {
                setIsFetchingMenus(true);
                try {
                    const menusToFetch = menusV2.externalMenus.filter(
                        (menu) => !menus[menu.id]
                    );

                    await Promise.all(
                        menusToFetch.map((menu) => fetchIikoMenu(menu.id))
                    );

                    setIikoMenuIsFetched(true);
                } catch (error) {
                    console.error('Ошибка при загрузке всех меню:', error);
                } finally {
                    setIsFetchingMenus(false);
                }
            };

            fetchAllMenus();
        }
    }, [orgId, menusV2]); // Зависимости необходимые для запуска эффекта

    return { menuCache: menus, iikoMenuIsFetched, nomenclature };
}



export const useCartDetails = (cartState) => {
    const [storesInfo, setStoresInfo] = useState({})
    const [productsInfo, setProductsInfo] = useState({})
    const { menuCache, iikoMenuIsFetched, nomenclature } = useIikoMenu()



    useEffect(() => {
        const loadDetails = async () => {
            if (!cartState.stores) return
            const storeIds = Object.keys(cartState.stores)
            // console.log('storeIds ', storeIds)
            const newStoresInfo = {};
            const newProductsInfo = {};

            for (const storeId of storeIds) {
                const numericStoreId = parseInt(storeId, 10); // Преобразование storeId в число
                let storeInfo
                if (numericStoreId) {
                    storeInfo = await getStoreById(numericStoreId)
                } else {
                    storeInfo = await getStoreByCustomId(storeId)
                }

                // console.log('getStoreById ', storeInfo)
                if (storeInfo) {
                    newStoresInfo[storeId] = storeInfo;
                }

                if (storeInfo?.isCustom && storeInfo?.customId === 'eat') {
                    if (iikoMenuIsFetched) {
                        for (const item of cartState.stores[storeId].order) {
                            const productInfo = await getIikoProductById(item.id, menuCache);
                            if (productInfo) {
                                // console.log('productInfo ', productInfo)
                                newProductsInfo[item.id] = productInfo;
                            }
                        }
                    }
                } else {
                    for (const item of cartState.stores[storeId].order) {
                        const productInfo = await getProductById(item.id);
                        if (productInfo) {
                            // console.log('productInfo ', productInfo)
                            newProductsInfo[item.id] = productInfo;
                        }
                    }
                }
            }
            // console.log('newStoresInfo ', newStoresInfo)
            // console.log('newProductsInfo ', newProductsInfo)
            setStoresInfo(newStoresInfo);
            setProductsInfo(newProductsInfo);
        }

        loadDetails();
    }, [cartState, iikoMenuIsFetched]);

    return { storesInfo, productsInfo, menuCache, iikoMenuIsFetched, nomenclature }
}