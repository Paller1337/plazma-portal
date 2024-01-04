import { ReactSVG } from 'react-svg';

export default function Header() {
    return (<>
        <header className='header'>
            <div className='header__logo'>
                <ReactSVG src='/svg/logo-white.svg'></ReactSVG>
            </div>
            <div className='header__title'>
                гостевой портал
            </div>

            <div className='header__burger'>
                <ReactSVG src='/svg/burger.svg'></ReactSVG>
            </div>
        </header>
    </>)
}