import IndexNavButton from '@/components/IndexNavButton'
import NavBar from '@/components/NavBar'
import PromoSlider from '@/components/PromoSlider'
import ServiceShopCard from '@/components/ServiceShopCard'
import ServicesButton from '@/components/ServicesButton'
import { useCart } from 'context/CartContext'
import { ReactSVG } from 'react-svg'
import Router, { useRouter } from 'next/router'
import { getWordEnding } from 'functions'
import { GetServerSideProps } from 'next'
import { useEffect, useRef, useState } from 'react'
import { IService } from 'types/services'
import { useAuth } from 'context/AuthContext'
import { DEFAULTS } from 'defaults'
import HeaderUnder from '@/components/HeaderUndex'
import { useFooterBottomPadding } from 'functions'
import { withAuthServerSideProps } from 'helpers/withAuthServerSideProps'
import axios from 'axios'
import { Button, Input, LoadingOverlay, Textarea } from '@mantine/core'
import { axiosInstance } from 'helpers/axiosInstance'
import { cacheToRedis, getCachedRedis } from 'helpers/bnovo/auth'
import { IikoMenu } from 'types/iiko'
import { useIntersection } from '@mantine/hooks'
import ScrollMenuTags from '@/components/ScrollMenuTags'
import DishItem from '@/components/DishItem'

const ROOM_SERVICES = [
    {
        id: 1,
        title: 'Халат',
        price: 800,
        img: '/images/room-services/bathrobe.png',
    },
    {
        id: 2,
        title: 'Тапочки',
        price: 200,
        img: '/images/room-services/slippers.png',
    },
    {
        id: 3,
        title: 'Халат-2',
        price: 1200,
        img: '/images/room-services/bathrobe.png',
    },
    {
        id: 4,
        title: 'Тапочки-2',
        price: 600,
        img: '/images/room-services/slippers.png',
    },
    {
        id: 2,
        title: 'Тапочки',
        price: 200,
        img: '/images/room-services/slippers.png',
    },
    {
        id: 3,
        title: 'Халат-2',
        price: 1200,
        img: '/images/room-services/bathrobe.png',
    },
    {
        id: 4,
        title: 'Тапочки-2',
        price: 600,
        img: '/images/room-services/slippers.png',
    },
]

interface FoodDeliveryPageProps {
    dish: any[]
}

// export const getServerSideProps: GetServerSideProps = withAuthServerSideProps(async (context) => {
//     try {
//         const res = await axios.get(`${DEFAULTS.SOCKET.URL}/api/services`, {
//             params: {
//                 'populate': 'deep,3'
//             }
//         })
//         // if (!res.data) {
//         //     throw new Error(`Failed to fetch services, received status ${res.status}`)
//         // }
//         const data = await res.data

//         return {
//             props: {
//                 services: data.data
//             } as ServicesPageProps
//         }
//     } catch (error) {
//         console.error('Ошибка при получении услуг:', error)
//         return {
//             props: {
//                 services: []
//             } as ServicesPageProps
//         }
//     }
// })

export default function FoodPage(props: FoodDeliveryPageProps) {
    useFooterBottomPadding(100)

    const { state } = useCart()
    const { food } = state

    const itemCount = state.food.items.reduce((total, item) => total + item.quantity, 0)


    const [authResult, setAuthResult] = useState(null) //temp
    const [orgResult, setOrgResult] = useState(null) //temp
    const [menusResult, setMenusResult] = useState(null) //temp
    const [menuByIdResult, setMenuByIdResult] = useState(null) //temp
    const [currentMenu, setCurrentMenu] = useState<IikoMenu>(null) //temp

    const [activeMenuId, setActiveMenuId] = useState('')

    const [dishMenus, setDishMenus] = useState<IikoMenu[]>([]) //temp

    const [menuId, setMenuId] = useState('')
    const [menuIds, setMenuIds] = useState([])

    const tagRefs = useRef<(HTMLDivElement | null)[]>([])
    const categoryRefs = useRef([])


    const iikoMenus = async () => {
        setMenuIds([])
        const menus = await axiosInstance.post('/api/iiko/menu')
        // const resString = JSON.stringify(menus.data, null, 2)

        setMenuIds(prevMenuIds => [...prevMenuIds, ...menus.data?.externalMenus.map(x => x.id)])
        // setMenusResult(resString)
    }

    useEffect(() => {
        iikoMenus()
    }, [])
    useEffect(() => {
        if (menuIds.length > 0) {
            const fetchDishMenus = async () => {
                const fetchedDishMenus = []
                for (const menuId of menuIds) {
                    const menu = await axiosInstance.post(`/api/iiko/menu/${menuId}`)
                    fetchedDishMenus.push(menu.data)
                }
                setDishMenus(fetchedDishMenus)
                console.log(fetchedDishMenus)
            }
            fetchDishMenus()
        }
    }, [menuIds])


    useEffect(() => {
        const handleScroll = () => {
            const menuCategories = document.querySelectorAll('.menu-category');

            let currentActiveMenuId = ''

            for (let i = 0; i < menuCategories.length; i++) {
                const menuCategory = menuCategories[i] as HTMLElement
                const { top, bottom } = menuCategory.getBoundingClientRect()
                if (top <= 100 && bottom >= 0) {
                    currentActiveMenuId = menuCategory.dataset.menuId
                    break;
                }
            }

            if (activeMenuId !== currentActiveMenuId) {
                setActiveMenuId(currentActiveMenuId)
            }
        }

        window.addEventListener('scroll', handleScroll, {
            capture: true
        })

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])


    return (<>
        <HeaderUnder title='Доставка еды в номер' onClick={() => Router.push('/services')} />
        <main className='--gray-main no-padding'>
            <div className='page-wrapper'>
                <div className='dish-menu'>
                    {dishMenus ?
                        <ScrollMenuTags tagRefs={tagRefs} dishMenus={dishMenus} activeId={activeMenuId} />
                        : <></>}
                    <div className='menu-list'>
                        {dishMenus ?
                            dishMenus.map(menu => menu.itemCategories.map((cat, index) => {
                                if (cat.items.length > 0) {
                                    return (
                                        <div className='menu-category'
                                            data-menu-id={cat.id.toString()}
                                            key={cat.id}
                                            data-index={index}
                                            ref={el => categoryRefs.current[index] = el}
                                        >
                                            <div className='menu-category__header'>
                                                <div className='menu-category__header-inner'>
                                                    {cat.name}
                                                </div>
                                            </div>
                                            <div className='menu-category__dishes'>
                                                {cat.items.map(item =>
                                                    <DishItem key={item.itemId} item={item} />
                                                )}
                                            </div>
                                        </div>
                                    )
                                }
                            }
                            ))
                            :
                            <LoadingOverlay
                                visible={true}
                                zIndex={1000}
                                overlayProps={{ radius: 'sm', blur: 2 }}
                                loaderProps={{ color: 'gray', type: 'oval' }}
                            />
                        }
                    </div>
                </div>
                {/* <div className='room-services'>
                    <div className='--dev' style={{ width: '100%', }}>
                        <Button fullWidth color='blue' variant='filled' onClick={iikoMenus}>Запрос списка меню</Button>
                        <Textarea
                            placeholder="Autosize with no rows limit"
                            label="Ответ меню:"
                            value={menuIds ? menuIds : ''}
                            autosize
                            minRows={2}
                            style={{ margin: '20px 0 80px 0' }}
                        />
                        <Textarea
                            placeholder="Autosize with no rows limit"
                            label="Ответ меню:"
                            value={menusResult ? menusResult : ''}
                            autosize
                            minRows={2}
                            style={{ margin: '0px 0 80px 0' }}
                        />
                    </div>
                </div> */}


            </div>

            <div className='room-services__order-wrapper'>
                <div className='room-services__order'>
                    <div className='room-services__amount'>
                        <span className='room-services__amount-title'>Сумма заказа</span>
                        <span className='room-services__amount-sum'>{food.total} ₽</span>
                    </div>

                    <div className='room-services__cart-btn' onClick={() => Router.push('/order/food')}>
                        <ReactSVG className='room-services__cart-logo' src='/svg/cart-white.svg' />
                        {itemCount} позици{getWordEnding(itemCount)}
                    </div>
                </div>
            </div>
        </main >
        <NavBar page='services' />
    </>)
}