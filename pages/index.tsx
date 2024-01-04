import IndexNavButton from '@/components/IndexNavButton'
import NavBar from '@/components/NavBar'
import PromoSlider from '@/components/PromoSlider'
import { ReactSVG } from 'react-svg'

const slides = [
    {
        title: 'Скидка 20% на доставку',
        desc: 'Акция распространяется на мясные блюда и действительна до 3 января 16:00.',
        img: '/images/promo/slide-1.png',
        btn: {
            name: 'Подробнее',
            link: '/',
        }
    },
    {
        title: 'Скидка 15% на доставку',
        desc: 'Акция распространяется на мясные блюда и действительна до 3 января 16:00.',
        img: '/images/promo/slide-1.png',
        btn: {
            name: 'Подробнее',
            link: '/',
        }
    },
    {
        title: 'Скидка 10% на доставку',
        desc: 'Акция распространяется на мясные блюда и действительна до 3 января 16:00.',
        img: '/images/promo/slide-1.png',
        btn: {
            name: 'Подробнее',
            link: '/',
        }
    },
]

export default function IndexPage() {

    return (<>
        <main>
            <PromoSlider slides={slides} />

            <div className='index-nav'>
                <IndexNavButton
                    title='Навигация'
                    desc='Карта парк-отеля'
                    svgName='map'
                />

                <IndexNavButton
                    title='Информация'
                    desc='Вопросы и ответы на них'
                    svgName='question'
                />

                <IndexNavButton
                    title='Помощь'
                    desc='Ваша заявка в очереди'
                    status='#f23'
                    svgName='help'
                    isHelpButton
                />
            </div>
        </main>


        <NavBar page='index' />
    </>)
}