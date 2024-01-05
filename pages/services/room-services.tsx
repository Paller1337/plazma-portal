import IndexNavButton from '@/components/IndexNavButton'
import NavBar from '@/components/NavBar'
import PromoSlider from '@/components/PromoSlider'
import ServiceShopCard from '@/components/ServiceShopCard'
import ServicesButton from '@/components/ServicesButton'
import { useCart } from 'context/CartContext'
import { ReactSVG } from 'react-svg'
import Router from 'next/router'
import { getWordEnding } from 'functions'

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

export default function ServicesPage() {
    const { state } = useCart()
    const { services } = state

    const itemCount = state.services.items.reduce((total, item) => total + item.quantity, 0)

    return (<>
        <main className='--gray-main'>

            <div className='page-wrapper'>
                <div className='room-services'>
                    {ROOM_SERVICES.map((x, i) =>
                        <ServiceShopCard
                            key={'service-' + x.title + i}
                            productId={x.id.toString()}
                            title={x.title}
                            price={x.price}
                            image={x.img}
                        />
                    )}
                </div>
            </div>

            <div className='room-services__order-wrapper'>
                <div className='room-services__order'>
                    <div className='room-services__amount'>
                        <span className='room-services__amount-title'>Сумма заказа</span>
                        <span className='room-services__amount-sum'>{services.total} ₽</span>
                    </div>

                    <div className='room-services__cart-btn' onClick={() => Router.push('/order/services')}>
                        <ReactSVG className='room-services__cart-logo' src='/svg/cart-white.svg' />
                        {itemCount} позици{getWordEnding(itemCount)}
                    </div>
                </div>
            </div>
        </main>
        <NavBar page='services' />
    </>)
}