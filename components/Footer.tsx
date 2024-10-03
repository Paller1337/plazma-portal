import { useAuth } from 'context/AuthContext'
import { DEFAULTS } from 'defaults'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { ReactSVG } from 'react-svg'

export default function Footer() {
    // const { isAuthenticated } = useAuth()
    const router = useRouter()
    useEffect(() => {
        console.log('router: ', router)
    }, [router])
    if (!router.pathname.includes('store'))
        return (<>

            <footer className='footer'>
                <div className='footer__wrapper'>
                    <span className='footer__title'>Контакты</span>
                    <div className='footer__text-wrap'>
                        <span className='footer__text'>
                            Ресепшен:  +7 (910) 168-17-61
                        </span>
                        <span className='footer__text'>
                            Ресторан:  +7 (920) 275-63-12
                        </span>
                        <span className='footer__text'>
                            Почта:  hotel@kplazma.ru
                        </span>
                    </div>
                    <div className='footer__copyright'>
                        © 2024 Парк-отель «PLAZMA». Все права защищены.
                    </div>

                    <div className='footer__socials'>
                        <Link target='_blank' className='footer__social-btn' href={DEFAULTS.SOCIALS.telegram}>
                            <ReactSVG src='/svg/telegram-white.svg' />
                        </Link>
                        <Link target='_blank' className='footer__social-btn' href={DEFAULTS.SOCIALS.vk}>
                            <ReactSVG src='/svg/vk-white.svg' />
                        </Link>
                    </div>
                </div>
            </footer>
        </>)
    else return (<></>)
}