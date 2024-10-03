import { useAuth } from 'context/AuthContext'
import useIsPwa from 'helpers/frontend/pwa'
import Link from 'next/link'
import Router, { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { ReactSVG } from 'react-svg'

type TPortalPages = 'index' | 'services' | 'help' | 'basket/history'

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
        path: 'basket/history',
    },
]

export default function NavBar(props: NavBarProps) {
    const isPWA = useIsPwa()
    const router = useRouter()
    const { isPwaBannerHidden, setIsPwaBannerHidden } = useAuth()

    return (<>
        <div className='navbar'>
            {/* {!isPWA && !isPwaBannerHidden ?
                <div className='pwa-banner'>
                    <div className='pwa-banner__wrapper'>
                        <div className='pwa-banner__text'>
                            Установите Гостевой <br />Портал на Ваш телефон
                        </div>

                        <div className='index-nav__inner-btn index-nav__inner-btn_dark'
                            onClick={() => router.push('/install')}>
                            Установить
                        </div>
                        <div className='pwa-banner__close' onClick={() => setIsPwaBannerHidden(true)}>
                            X
                        </div>
                    </div>
                </div>
                : <></>} */}

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