import { ReactSVG } from 'react-svg';

export default function Footer() {


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
                    <div className='footer__social-btn'>
                        <ReactSVG src='/svg/telegram-white.svg' />
                    </div>
                    <div className='footer__social-btn'>
                        <ReactSVG src='/svg/vk-white.svg' />
                    </div>
                </div>
            </div>
        </footer>
    </>)
}