import { useRouter } from 'next/router';
import { useEffect, useState } from 'react'
import { ReactSVG } from 'react-svg';

interface WelcomeScreenProps {
    show: boolean
    end: boolean
}

export default function WelcomeScreen(props: WelcomeScreenProps) {
    const [showCSS, setShowCSS] = useState(false)
    const [loadingAnimate, setLoadingAnimate] = useState(false)

    useEffect(() => {
        if (props.show) {
            const timerCSS = setTimeout(() => {
                setShowCSS(true)
            }, 200)
            const loadingAnimate = setTimeout(() => {
                setLoadingAnimate(true)
            }, 800)

            const timer = setTimeout(() => {
            }, 2000)
            return () => {
                clearTimeout(timerCSS)
                clearTimeout(loadingAnimate)
                clearTimeout(timer)
            }
        }
    }, [props.show, props])

    if (!props.show) return null

    return (
        <div className={`welcome-screen ${showCSS && !props.end ? 'show' : ''}`}>
            <div className='welcome-screen__wrapper'>
                <div className={`auth-page__logo`}>
                    <ReactSVG src='/svg/logo-dark-x128.svg' />
                </div>

                <p className={`welcome-screen__text`}>Добро пожаловать!</p>

                <div className={`loading-bar__container`}>
                    <div className={`loading-bar ${loadingAnimate ? 'animate' : ''}`}></div>
                </div>
            </div>
        </div>
    )
}
