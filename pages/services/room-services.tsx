import CartModal from '@/components/CartModal'
import IndexNavButton from '@/components/IndexNavButton'
import NavBar from '@/components/NavBar'
import PromoSlider from '@/components/PromoSlider'
import ServiceShopCard from '@/components/ServiceShopCard'
import ServicesButton from '@/components/ServicesButton'
import { useCart } from 'context/CartContext'
import { ReactSVG } from 'react-svg'

const ROOM_SERVICES = [
    {
        title: 'Халат',
        price: 800,
        img: '/images/room-services/bathrobe.png',
    },
    {
        title: 'Тапочки',
        price: 200,
        img: '/images/room-services/slippers.png',
    },
    {
        title: 'Халат',
        price: 1200,
        img: '/images/room-services/bathrobe.png',
    },
    {
        title: 'Тапочки',
        price: 600,
        img: '/images/room-services/slippers.png',
    },
    {
        title: 'Тапочки',
        price: 200,
        img: '/images/room-services/slippers.png',
    },
    {
        title: 'Халат',
        price: 1200,
        img: '/images/room-services/bathrobe.png',
    },
    {
        title: 'Тапочки',
        price: 600,
        img: '/images/room-services/slippers.png',
    },
]

export default function ServicesPage() {
    const { state } = useCart()

    return (<>
        <main className='--gray-main'>

            <div className='page-wrapper'>
                <div className='room-services'>
                    {ROOM_SERVICES.map(x =>
                        <ServiceShopCard
                            key={'service-' + x.title}
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
                        <span className='room-services__amount-sum'>{state.total} ₽</span>
                    </div>

                    <CartModal />
                    {/* <div className='room-services__cart-btn'>
                        <ReactSVG className='room-services__cart-logo' src='/svg/cart-white.svg' />
                        3 позиции
                    </div> */}
                </div>
            </div>
        </main>
        <NavBar page='services' />
    </>)
}