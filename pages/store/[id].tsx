import Button from '@/components/Button'
import ProductModal from '@/components/ProductModal'
import axios from 'axios'
import { useCart } from 'context/CartContext'
import { DEFAULTS } from 'defaults'
import { axiosInstance } from 'helpers/axiosInstance'
import { getStoreById } from 'helpers/cartContext'
import { withAuthServerSideProps } from 'helpers/withAuthServerSideProps'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { ReactSVG } from 'react-svg'

export interface IProduct {
    id: number,
    name: string,
    memo_text?: string,
    description?: string,
    price?: number,
    for_sale?: boolean,
    image?: string,
    warning_text?: string,
}

interface IStore {
    id?: string,
    title?: string
    description?: string
    image?: string
    products?: IProduct[]
}

interface StorePageProps {
    store?: IStore
}

export const getServerSideProps: GetServerSideProps = withAuthServerSideProps(async (context) => {
    const { id } = context.params
    console.log('id ', id)
    try {
        const store = await axiosInstance.get(`/api/store/${id}`)

        console.log('store  ', store.data)

        return {
            props: {
                // article: article.data,
                store: {
                    id: id,
                    title: store.data.data.attributes.title || '',
                    description: store.data.data.attributes.description || '',
                    image: store.data.data.attributes.image.data.attributes.url || '',
                    preview_size: store.data.data.attributes.preview_size || 'min',
                    category: {
                        id: store.data.data.attributes.category.data.id || 0,
                        name: store.data.data.attributes.category.data.attributes.name || '',
                    },
                    products: store.data.data.attributes.products.data ? store.data.data.attributes.products.data.map(p => ({
                        id: p.id,
                        name: p.attributes.name || 'Без имени',
                        description: p.attributes.description || '',
                        price: p.attributes.price || 0,
                        for_sale: p.attributes.for_sale || false,
                        memo_text: p.attributes.memo_text || '',
                        warning_text: p.attributes.warning_text || '',
                        image: p.attributes.image.data.attributes.url || '',
                    })) : []
                }
            } as StorePageProps
        }
    } catch (error) {
        console.error('Ошибка при получении статьи:', error)
        return {
            props: {
                article: []
            } as StorePageProps
        }
    }
})


export default function StorePage(props: StorePageProps) {
    const [productModalIsOpen, setProductModalIsOpen] = useState(false)
    const [currentProduct, setCurrentProduct] = useState(null)
    const { state, productsInfo, storesInfo } = useCart()
    const router = useRouter()

    // @ts-ignore
    const currentStoreState = state.stores[props.store.id]
    useEffect(() => {
        // console.log('props.store ', props.store)
        // console.log('currentStoreState: ', currentStoreState)
    }, [])

    useEffect(() => {
        console.log('state ', state)
        console.log('productsInfo ', productsInfo)
        console.log('storesInfo ', storesInfo)
    }, [])

    const closeProductModal = () => setProductModalIsOpen(false)
    const openProductModal = (product) => {
        setProductModalIsOpen(true)
        setCurrentProduct(product)
    }

    useEffect(() => { console.log('currentProduct: ', currentProduct) }, [currentProduct])

    const fetch = async () => {
        await getStoreById(parseInt(props.store.id))
    }

    return (<>
        <ProductModal isOpen={productModalIsOpen} onClose={closeProductModal} product={currentProduct} storeId={props.store?.id} />
        <div className='index-preview'>
            <div className='store-header'>
                <div className='store-header__content'>
                    <span className='back-button' onClick={() => router.back()}>
                        <ReactSVG src='/svg/arrowleft.svg' />
                    </span>
                </div>
            </div>
            <img src={`${DEFAULTS.STRAPI.url + props.store?.image}`} alt='' />
        </div>

        <main className='swing-main'>

            {/* <div className='article-content' dangerouslySetInnerHTML={{ __html: props.article?.content }}  >
            </div> */}
            <div className='store-content'>
                <div className='store-content__info'>
                    <span className='store-content__title' onClick={fetch}>{props.store?.title}</span>
                    <span className='store-content__description'>{props.store?.description}</span>
                    {/* <span className='store-content__description'>{'Для оформления заказа необходимо авторизоваться'}</span> */}
                </div>
                <div className='store-content__products'>
                    {props.store?.products?.map(product => (
                        <div key={product.name + product.id} className='store-content__product' onClick={() => openProductModal(product)}>
                            <div className={`store-content__product-image${product.price && product.price > 0 ? ' with-price' : ''}`}>
                                <img src={`${DEFAULTS.STRAPI.url + product.image}  `} alt='' />
                                {/* <span className='store-content__product-price'>{product.price} ₽</span> */}
                                {product.price && product.price > 0 ? <span className='store-content__product-price'>{product.price} ₽</span> : <></>}
                            </div>
                            <div className='store-content__product-info'>
                                <span className='store-content__product-name'>{product.name}</span>
                                <span className='store-content__product-memo_text'>{product.memo_text}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {currentStoreState && currentStoreState?.order.length > 0 ?
                <div className='store-cart-button'>
                    <Link className='portal-button portal-button_stretch' href={`/basket/${props.store?.id}`}
                        style={{ backgroundColor: 'rgb(86, 117, 75)' }}
                        prefetch
                    >
                        Перейти к заказу
                    </Link>
                    {/* <Button text='' bgColor='' stretch onClick={() => router.push(`/basket/${props.store?.id}`)} /> */}
                </div>
                : <></>}
        </main >

    </>)
}