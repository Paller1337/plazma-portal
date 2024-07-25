import axios from 'axios'
import { useEffect, useState } from 'react'
import { DEFAULTS } from 'defaults'
import { axiosInstance } from './axiosInstance'
import { IProduct } from 'types/order'


export const getStoreById = async (id: number) => {
    try {
        // const store = await axios.get(`${DEFAULTS.STRAPI.url}/api/stores/${id}`, {
        //     params: {
        //         'populate': 'deep,3',
        //     }
        // })

        const store = await axiosInstance.get(`/api/store/${id}`)

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
            }
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


export const useCartDetails = (cartState) => {
    const [storesInfo, setStoresInfo] = useState({});
    const [productsInfo, setProductsInfo] = useState({});

    useEffect(() => {
        const loadDetails = async () => {
            if (!cartState.stores) return
            const storeIds = Object.keys(cartState.stores)
            // console.log('storeIds ', storeIds)
            const newStoresInfo = {};
            const newProductsInfo = {};

            for (const storeId of storeIds) {
                const numericStoreId = parseInt(storeId, 10); // Преобразование storeId в число
                const storeInfo = await getStoreById(numericStoreId)
                // console.log('getStoreById ', storeInfo)
                if (storeInfo) {
                    newStoresInfo[storeId] = storeInfo;
                }

                for (const item of cartState.stores[storeId].order) {
                    const productInfo = await getProductById(item.id);
                    if (productInfo) {
                        // console.log('productInfo ', productInfo)
                        newProductsInfo[item.id] = productInfo;
                    }
                }
            }
            console.log('newStoresInfo ', newStoresInfo)
            console.log('newProductsInfo ', newProductsInfo)
            setStoresInfo(newStoresInfo);
            setProductsInfo(newProductsInfo);
        }

        loadDetails();
    }, [cartState]);

    return { storesInfo, productsInfo }
}