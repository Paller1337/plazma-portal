import Link from 'next/link'
import Router from 'next/router'
import { useEffect } from 'react'
import { ReactSVG } from 'react-svg'

type TPortalPages = 'index' | 'services' | 'help' | 'order/history'

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
    // {
    //     title: 'Профиль',
    //     logo: 'profile',
    //     path: 'profile',
    // },
    {
        title: 'Мои заказы',
        logo: 'cart',
        path: 'order/history',
    },
]

export default function NavBar(props: NavBarProps) {
    useEffect(() => {

        console.log('        props.page: ', Router.asPath

        )
    })
    return (<>
        <div className='navbar'>
            <div className='navbar__wrapper'>
                {PAGES.map(x =>
                    <Link key={'nav-' + x.logo} className={`navbar__button ${x.path === props.page ? 'active' : ''}`}
                        href={`/${x.path === 'index' ? '' : x.path}`}
                    >
                        <div className='navbar__logo'>
                            <ReactSVG src={`/svg/navbar/${x.logo}.svg`} />
                        </div>
                        <span className='navbar__text'>{x.title}</span>
                    </Link>
                )}
            </div>
        </div>
    </>)
}