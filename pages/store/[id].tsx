import Button from '@/components/Button'
import ProductModal from '@/components/ProductModal'
import axios from 'axios'
import { useCart } from 'context/CartContext'
import { DEFAULTS } from 'defaults'
import { axiosInstance } from 'helpers/axiosInstance'
import { getStoreById } from 'helpers/cartContext'
import { withAuthServerSideProps } from 'helpers/withAuthServerSideProps'
import { DateTime } from 'luxon'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { ReactSVG } from 'react-svg'
import { getStoreStatus } from 'utils/storeStatus'
import { Paper, Text } from '@mantine/core'
import { getStoreResult } from 'helpers/getStoreResult'

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

export interface IStoreWorkTime {
    weekday: {
        day: string,
        name: string
    }
    start: string
    end: string
}

export type IStoreFeeType = 'fix' | 'percent'
export interface IStoreFee {
    name: string,
    description: string
    type: IStoreFeeType
    value: number
}

export interface IPaymentSystem {
    id: number
    name: string,
    title: string,
    title_system?: string,
    title_staff?: string,
    requisites: string,
}
export interface IStore {
    id?: string,
    title?: string
    description?: string
    payment_system?: IPaymentSystem
    image?: string
    products?: IProduct[]
    preview_size?: string
    category: {
        id: number
        name: string
    },
    storeType?: {
        label: string,
        value: string,
    }
    storeWorktime?: IStoreWorkTime[]
    fee?: IStoreFee
    isActive?: boolean
    isCustom?: boolean
    customId?: string
    min_order_amount?: number
}

interface StorePageProps {
    store?: IStore
}

export const getServerSideProps: GetServerSideProps = withAuthServerSideProps(async (context) => {
    const { id } = context.params
    console.log('id ', id)
    try {
        if ((id as string) != '0') {
            const storeData = (await axiosInstance.get(`/api/store/${id}`)).data
            const store = getStoreResult(storeData.data)

            console.log({ store })

            return {
                props: {
                    store: store
                } as StorePageProps
            }
        } else {
            return {
                props: {
                    store: null
                } as StorePageProps
            }
        }
    } catch (error) {
        console.error('Ошибка при получении данных о магазине:', error)
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


    const storeStatus = getStoreStatus(props.store?.storeWorktime)
    useEffect(() => console.log({ worktime: getStoreStatus(props.store?.storeWorktime) }), [])
    // @ts-ignore
    const currentStoreState = state.stores[props.store?.id]
    const total = currentStoreState?.order?.reduce((acc, curr) => acc + productsInfo[curr.id.toString()]?.price * curr.quantity, 0) || 0
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
        await getStoreById(parseInt(props.store?.id))
    }

    return (<>
        <ProductModal isOpen={productModalIsOpen} onClose={closeProductModal} product={currentProduct} storeId={props.store?.id} storeStatus={storeStatus} />
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
                    {storeStatus.untilClose_min && storeStatus.untilClose_min < 45 ?
                        <Paper mt={8} px={12} py={4} radius={'lg'} bg={'orange'} w={'fit-content'}>
                            <Text fw={600} fz={14} c={'white'}>До закрытия {storeStatus.untilClose}</Text>
                        </Paper>
                        : <></>
                    }
                    {storeStatus.untilOpen_min ?
                        <Paper mt={8} px={12} py={4} bg={'green'} radius={'lg'} w={'fit-content'}>
                            <Text fw={600} fz={14} c={'white'}>До открытия {storeStatus.untilOpen}</Text>
                        </Paper>
                        : <></>
                    }
                    {/* <span className='store-content__description'>{'Для оформления заказа необходимо авторизоваться'}</span> */}
                </div>
                <div className='store-content__products'>
                    {props.store?.products?.filter(p => p.for_sale === true).map(product => (
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
                    <Link className={`portal-button portal-button_stretch ${!storeStatus.isOpen ? ' portal-button_disabled' : ''}`} href={`/basket/${props.store?.id}`}
                        style={{ backgroundColor: 'rgb(86, 117, 75)' }}
                        prefetch
                    >
                        {!storeStatus.isOpen ? 'До открытия ' + storeStatus.untilOpen : `Перейти к заказу ${total ? `${total}₽` : ''}`}
                    </Link>
                    {/* <Button text='' bgColor='' stretch onClick={() => router.push(`/basket/${props.store?.id}`)} /> */}
                </div>
                : <></>}
        </main >

    </>)
}