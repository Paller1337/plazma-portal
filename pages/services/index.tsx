import IndexNavButton from '@/components/IndexNavButton'
import NavBar from '@/components/NavBar'
import PromoSlider from '@/components/PromoSlider'
import ServicesButton from '@/components/ServicesButton'
import { ReactSVG } from 'react-svg'

const SERVICES = [
    {
        title: 'Услуги в номер',
        desc: 'Доставим к вашему номеру',
        img: '/images/services/room-services.png',
        link: '/services/room-services'
    },
    {
        title: 'Заказать еду',
        desc: 'Доставим к вашему номеру',
        img: '/images/services/eat-delivery.png',
    },
    {
        title: 'Сауны',
        desc: 'Три вида сауны в шаговой доступности',
        img: '/images/services/saunas.png',
    },
]

export default function ServicesPage() {

    return (<>
        <main className='--gray-main'>
            <div className='page-wrapper'>
                <div className='services-buttons'>
                    {SERVICES.map(x =>
                        <ServicesButton
                            key={'service-' + x.title}
                            title={x.title}
                            desc={x.desc}
                            link={x.link}
                            image={x.img}
                        />
                    )}
                </div>
            </div>
        </main>
        <NavBar page='services' />
    </>)
}