import { useAuth } from 'context/AuthContext';
import { ReactSVG } from 'react-svg';

export default function Header() {
    const { isAuthenticated } = useAuth()
    
    if (isAuthenticated) return (<>
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
    else return (<></>)
}