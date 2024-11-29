import Button from '@/components/Button'
import ProductModal from '@/components/ProductModal'
import axios from 'axios'
import { useCart } from 'context/CartContext'
import { DEFAULTS } from 'defaults'
import { axiosInstance } from 'helpers/axiosInstance'
import { withAuthServerSideProps } from 'helpers/withAuthServerSideProps'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { ReactSVG } from 'react-svg'
import * as iiko from '../../helpers/iiko/iikoExternalClientApi'
import { MenusV2Response, MenuV2ByIdResponse } from 'helpers/iiko/IikoApi/types'
import { Box, Image, Loader, Paper, SegmentedControl, Skeleton, Stack, Text } from '@mantine/core'
import { useMove } from '@mantine/hooks'
// import { Carousel } from '@mantine/carousel'
import dynamic from 'next/dynamic'
import ProductEatModal from '@/components/ProductEatModal'
import Id from 'pages/admin/banquet-management/[id]'
import { default as NextImage } from 'next/image'
import { IStore } from './[id]'
import { getStoreStatus } from 'utils/storeStatus'
import { getStoreResult } from 'helpers/getStoreResult'

const EatMenuControl = dynamic(() => import('@/components/EatMenuControl').then((mod) => mod.default), { ssr: false })

// export interface IProduct {
//     id: number,
//     name: string,
//     memo_text?: string,
//     description?: string,
//     price?: number,
//     for_sale?: boolean,
//     image?: string,
//     warning_text?: string,
// }

// interface IStore {
//     id?: string,
//     title?: string
//     description?: string
//     image?: string
//     products?: IProduct[]
//     isActive?: boolean
//     isCustom?: boolean
//     customId?: string
// }

interface EatPageProps {
    menus?: MenusV2Response
    store?: IStore
    targetId?: string
}

export const getServerSideProps: GetServerSideProps = withAuthServerSideProps(async (context) => {
    const { id } = context.query


    const storeData = (await axiosInstance.get(`/api/store/custom/eat`)).data
    const data = storeData.data?.length > 0 ? storeData.data[0] : null
    const store = getStoreResult(data)

    try {
        const menus = await iiko.fetchMenusV2()
        const targetId = menus.externalMenus.find(m => m.id === id)?.id
        return {
            props: {
                menus: menus,
                targetId: targetId ? targetId : menus.externalMenus[0].id,
                store: store
            } as EatPageProps
        }
    } catch (error) {
        console.error('Ошибка при получении статьи:', error)
        return {
            props: {
                menus: null,
                store: null,
                targetId: ''
            } as EatPageProps
        }
    }
})

const ImageLoader = ({ src }) => {
    const [isLoading, setIsLoading] = useState(true)

    const keyStr =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    const triplet = (e1: number, e2: number, e3: number) =>
        keyStr.charAt(e1 >> 2) +
        keyStr.charAt(((e1 & 3) << 4) | (e2 >> 4)) +
        keyStr.charAt(((e2 & 15) << 2) | (e3 >> 6)) +
        keyStr.charAt(e3 & 63);

    const rgbDataURL = (r: number, g: number, b: number) =>
        `data:image/gif;base64,R0lGODlhAQABAPAA${triplet(0, r, g) + triplet(b, 255, 255)
        }/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==`;

    useEffect(() => {
        if (src) {
            const fetchImage = async () => {
                await axios.get(src, {
                    onDownloadProgress(progressEvent) {
                        progressEvent.download && setIsLoading(false)
                    },
                })
            }
            fetchImage()
        } else {
            setIsLoading(false)
        }
    }, [src])
    return (
        <Stack
            h='inherit'
            style={{
                border: '1px solid #262e4a',
                borderRadius: 18,
                overflow: 'hidden',
            }}
            justify='center'
            align='center'
        >
            {isLoading ?
                <Stack align='center' justify='center'><Loader color='#262e4a' /></Stack>
                : <NextImage
                    src={src || '/images/fallback.png'}
                    alt=''
                    objectFit='cover'
                    fill
                    fetchPriority='high'
                    placeholder="blur"
                    blurDataURL={rgbDataURL(38, 46, 74)}
                />
            }
        </Stack>
    )
}

export default function CustomStorePage(props: EatPageProps) {
    const customStoreId = 'eat'

    const [productModalIsOpen, setProductModalIsOpen] = useState(false)
    const [currentProduct, setCurrentProduct] = useState(null)
    const [currentProductNomenclature, setCurrentProductNomenclature] = useState(null)

    const [currentMenuId, setCurrentMenuId] = useState(null)
    const [currentMenu, setCurrentMenu] = useState<MenuV2ByIdResponse>(null)

    const [isShadow, setIsShadow] = useState(false)

    const [isActive, setIsActive] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const storeStatus = getStoreStatus(props.store.storeWorktime)
    const paddingOffset = (storeStatus.untilClose_min && storeStatus.untilClose_min < 45) || storeStatus.untilOpen_min ? 240 : 190
    const firstCat = currentMenu?.itemCategories.filter(c => c.items.length > 0)[0]

    useEffect(() => console.log({ worktime: getStoreStatus(props.store.storeWorktime) }), [])

    const { state, productsInfo, nomenclature, menuCache, iikoMenuIsFetched } = useCart()
    const router = useRouter()

    // @ts-ignore
    const currentStoreState = state.stores[customStoreId]
    const total = currentStoreState?.order?.reduce((acc, curr) => acc + productsInfo[curr.id.toString()]?.price * curr.quantity, 0) || 0

    const handleScroll = () => {
        const position = window.pageYOffset
        if (position > (paddingOffset - 160)) setIsShadow(true)
        else setIsShadow(false)
    }

    useEffect(() => {
        const fetchMenu = async () => {
            const menuId = props.targetId

            const menu = menuCache[menuId]
            console.log('current menu: ', menu)
            setCurrentMenu(menu)
        }
        if (props.store?.isActive) {
            setIsActive(props.store?.isActive)
        }

        if (props.targetId && props.store?.isActive) {
            setCurrentMenuId(props.targetId)
            fetchMenu().then(() => setIsLoading(false))
        }
    }, [props.targetId, props.store?.isActive, iikoMenuIsFetched])

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
        }
    }, [])


    useEffect(() => {
        if (currentMenu && nomenclature) {
            const product = nomenclature?.products.find(x => x.id === currentMenu?.itemCategories[0]?.items[14]?.itemId)
            console.log({ product })
            console.log({ menuCache })
            console.log({ nomenclature })
        }
        // console.log('currentStoreState: ', currentStoreState)
    }, [currentMenu, nomenclature])

    useEffect(() => {
        console.log('currentMenu ', currentMenu)
    }, [currentMenu])

    // useEffect(() => {
    //     console.log('state ', state)
    //     console.log('productsInfo ', productsInfo)
    //     console.log('storesInfo ', storesInfo)
    // }, [])

    const closeProductModal = () => setProductModalIsOpen(false)
    const openProductModal = (product, productNomen) => {
        setProductModalIsOpen(true)
        setCurrentProduct(product)
        setCurrentProductNomenclature(productNomen)
    }

    useEffect(() => {
        console.log('currentProduct: ', currentProduct)
        router.query.id = currentMenuId
        router.push({
            pathname: router.pathname,
            query: router.query
        }, undefined, { shallow: false })
    }, [currentMenuId])




    const tprice = 10000
    return (<>
        <ProductEatModal
            isOpen={productModalIsOpen}
            onClose={closeProductModal}
            product={currentProduct}
            productNomenclature={currentProductNomenclature}
            storeId={customStoreId}
            storeStatus={storeStatus}
        />
        {/* <div className='index-preview'>
            <div className='store-header'>
                <div className='store-header__content'>
                    <span className='back-button' onClick={() => router.back()}>
                        <ReactSVG src='/svg/arrowleft.svg' />
                    </span>
                </div>
            </div>
            <img src={`${DEFAULTS.STRAPI.url + ''}`} alt='' />
        </div> */}

        <main className='swing-main without-pb'>

            {/* <div className='article-content' dangerouslySetInnerHTML={{ __html: props.article?.content }}  >
            </div> */}
            <div className='store-content'>
                <div className={`store-content__info fixed ${isShadow ? ' shadow' : ''}`}>
                    <Stack gap={isShadow ? 0 : 8}>
                        <Stack gap={8} style={{
                            maxHeight: isShadow ? 0 : 300,
                            transition: 'max-height 0.24s ease-in-out',
                            overflow: 'hidden',
                        }}>
                            <span className='back-button' onClick={() => router.push('/', undefined, { shallow: true })}>
                                <ReactSVG src='/svg/arrowleft.svg' />
                            </span>
                            <Stack gap={0}>
                                <span className={'store-content__title'}>{props.store?.title}</span>
                                <span className={'store-content__description'}>{props.store?.description}</span>
                            </Stack>
                        </Stack>
                        <Stack gap={8}>
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

                            {isLoading ? <Skeleton height={24} radius="xl" /> :
                                isActive ? <EatMenuControl data={props.menus} onChange={setCurrentMenuId} currentMenuId={currentMenuId} /> : <></>
                            }
                        </Stack>
                    </Stack>
                </div>
                {isLoading || !firstCat ?
                    <Stack p={`${paddingOffset}px 0 150px`} gap={24}>
                        <Stack gap={8}>
                            <Skeleton height={32} width={'30%'} radius="md" />
                            <Skeleton height={12} width={'50%'} radius="md" />
                            <Stack gap={8}>
                                <Skeleton height={120} radius="md" />
                                <Skeleton height={120} radius="md" />
                                <Skeleton height={120} radius="md" />
                            </Stack>
                        </Stack>
                        <Stack gap={8}>
                            <Skeleton height={32} width={'30%'} radius="md" />
                            <Skeleton height={12} width={'50%'} radius="md" />
                            <Stack gap={8}>
                                <Skeleton height={120} radius="md" />
                                <Skeleton height={120} radius="md" />
                                <Skeleton height={120} radius="md" />
                            </Stack>
                        </Stack>
                    </Stack>
                    : isActive ?
                        <Stack p={`${paddingOffset}px 0 150px`}>
                            {currentMenu && currentMenu?.itemCategories.length > 0 && currentMenu?.itemCategories.filter(c => c.items.length > 0).length > 0
                                ? currentMenu?.itemCategories.filter(c => c.items.length > 0).map((cat, i) => {
                                    const itemsWithImage = cat.items.reduce((acc, item) => {
                                        if (item.itemSizes[0].buttonImageUrl || item.itemSizes[0].buttonImageCroppedUrl) {
                                            return acc + 1;
                                        }
                                        return acc;
                                    }, 0)

                                    return (
                                        <Stack key={cat.name + cat.id} gap={0} mt={i > 0 ? '24px' : '0px'}>
                                            <Text size='xl' fw={600} mb={4}>{cat.name}</Text>
                                            {cat.description ? <Text size='sm' fw={500}>{cat.description}</Text> : <></>}
                                            <div
                                                className={`store-content__products${itemsWithImage === 0 ? ' one-inline' : ''}`}
                                                style={{ marginTop: '16px', marginBottom: '16px' }}
                                            >
                                                {cat.items.length > 0 ?
                                                    itemsWithImage > 0
                                                        ? cat.items.map(item => {
                                                            const price = item.itemSizes[0].prices[0].price
                                                            const itemData = item.itemSizes[0]

                                                            const isImage = item.itemSizes[0].buttonImageUrl || item.itemSizes[0].buttonImageCroppedUrl ? true : false
                                                            const itemNomen = nomenclature.products.find(x => x.id === item.itemId)
                                                            return (
                                                                <div key={item.name + item.itemId} className='store-content__product'
                                                                    onClick={() => openProductModal(item, itemNomen)}
                                                                >
                                                                    <div className={`store-content__product-image${price && price > 0 ? ' with-price' : ''}`}>
                                                                        <ImageLoader src={itemData.buttonImageUrl} />
                                                                        {price && price > 0 ? <span className='store-content__product-price'>{price} ₽</span> : <></>}
                                                                    </div>
                                                                    <div className='store-content__product-info'>
                                                                        <span className='store-content__product-name'>{itemNomen.seoTitle}</span>
                                                                        {/* {item.tags.length > 0 ? <span className='store-content__product-memo_text'>
                                                            {item.tags?.map(tag => (`${tag.}`))}
                                                        </span> : <></>} */}
                                                                    </div>
                                                                </div>
                                                            )
                                                        })
                                                        : cat.items.map(item => {
                                                            const price = item.itemSizes[0].prices[0].price
                                                            const itemData = item.itemSizes[0]
                                                            const itemNomen = nomenclature.products.find(x => x.id === item.itemId)
                                                            console.log({ itemN: itemNomen })
                                                            return (
                                                                <div
                                                                    key={item.name + item.itemId}
                                                                    className='store-content__product inline'
                                                                    onClick={() => openProductModal(item, itemNomen)}
                                                                >
                                                                    <div className={`store-content__product-image${tprice && tprice > 0 ? ' with-price' : ''}`} style={{ background: itemNomen?.seoTitle ? 'green' : '#f1f3f5' }}>
                                                                        <div className='store-content__product-info'>
                                                                            <span className='store-content__product-name'>{itemNomen?.seoTitle ? itemNomen?.seoTitle : item.name}</span>
                                                                            <span className='store-content__product-size'> </span>
                                                                        </div>
                                                                        {price && price > 0 ? <span className='store-content__product-price'>{price} ₽</span> : <></>}
                                                                    </div>
                                                                </div>
                                                            )
                                                        })
                                                    : <></>}
                                            </div>
                                        </Stack>
                                    )
                                }) : <></>}

                            {/* <div className='store-content__product inline'>
                            <div className={`store-content__product-image${tprice && tprice > 0 ? ' with-price' : ''}`}>
                                <div className='store-content__product-info'>
                                    <span className='store-content__product-name'>Название</span>
                                    <span className='store-content__product-size'> </span>
                                </div>
                                {tprice && tprice > 0 ? <span className='store-content__product-price'>{tprice} ₽</span> : <></>}
                            </div>
                        </div> */}
                        </Stack>

                        : <Stack p={'190px 0 150px'} align='center'>
                            <Text size='xl' fw={500}>Заказ еды сейчас не работает</Text>

                            <Button text='Вернуться на главную' bgColor='rgb(86, 117, 75)' onClick={() => router.push('/', undefined, { shallow: true })} />
                        </Stack>}
            </div>


            {currentStoreState && currentStoreState?.order.length > 0 ?
                <div className='store-cart-button'>
                    <Link className={`portal-button portal-button_stretch ${!storeStatus.isOpen ? ' portal-button_disabled' : ''}`} href={`/basket/${customStoreId}`}
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