import Link from 'next/link'
import { ReactSVG } from 'react-svg'

type TPortalPages = 'index' | 'services' | 'help' | 'profile'

interface NavBarProps {
    page?: TPortalPages
}

const PAGES = [
    {
        title: 'Главная',
        logo: 'home',
        path: 'index',
    },
    {
        title: 'Услуги',
        logo: 'services',
        path: 'services',
    },
    {
        title: 'Помощь',
        logo: 'help',
        path: 'help',
    },
    {
        title: 'Профиль',
        logo: 'profile',
        path: 'profile',
    },
]

export default function NavBar(props: NavBarProps) {
    return (<>
        <div className='navbar'>
            <div className='navbar__wrapper'>
                {PAGES.map(x =>
                    <>
                        <Link className={`navbar__button ${x.path === props.page ? 'active' : ''}`}
                            href={`/${x.path === 'index' ? '' : x.path}`}
                        >
                            <div className='navbar__logo'>
                                <ReactSVG src={`/svg/navbar/${x.logo}.svg`} />
                            </div>
                            <span className='navbar__text'>{x.title}</span>
                        </Link>
                    </>
                )}
            </div>
        </div>
    </>)
}