// pages/install-guide.js

import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { ReactSVG } from 'react-svg'
import Button from '@/components/Button'
import { useRouter } from 'next/router'


const InstallGuide = () => {
    const [isAndroid, setIsAndroid] = useState(false)
    const [isIOS, setIsIOS] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const userAgent = navigator.userAgent || navigator.vendor
        setIsAndroid(/android/i.test(userAgent))
        setIsIOS(/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream)
    }, [])

    return (
        <>
            <Head>
                <title>Установка PWA</title>
            </Head>

            <main className='install-pwa'>
                <div className='install-pwa__logo'>
                    <ReactSVG src='/svg/logo-dark-x128.svg' />
                </div>

                <div>
                    <h1>Как установить Гостевой Портал</h1>
                    {isAndroid && (
                        <div className='install-pwa__guide'>
                            <h2 className='install-pwa__guide-title'>Для пользователей Android:</h2>
                            <ol>
                                <li>Откройте наше приложение в браузере Chrome.</li>
                                <li>Нажмите на иконку меню в правом верхнем углу (три точки).</li>
                                <li>Выберите пункт &ldquoДобавить на главный экран&ldquo.</li>
                                <li>Назовите иконку как вам удобно и подтвердите добавление.</li>
                                <li>Наше приложение теперь доступно на вашем главном экране!</li>
                            </ol>

                            <Button onClick={() => { setIsAndroid(false); setIsIOS(true) }} text='У меня iOS' stretch />
                        </div>
                    )}
                    {isIOS && (
                        <div className='install-pwa__guide'>
                            <h2 className='install-pwa__guide-title'>Для пользователей iOS:</h2>
                            <ol>
                                <li>Откройте наше приложение в Safari.</li>
                                <li>Нажмите на иконку поделиться в нижней части экрана.</li>
                                <li>Прокрутите вниз и выберите &ldquoДобавить на главный экран&ldquo.</li>
                                <li>Измените название приложения, если необходимо, и нажмите &ldquoДобавить&ldquo.</li>
                                <li>Наше приложение теперь у вас на главном экране!</li>
                            </ol>

                            <Button onClick={() => { setIsAndroid(true); setIsIOS(false) }} text='У меня Android' stretch />
                        </div>
                    )}
                    {!isAndroid && !isIOS && (
                        <p>Пожалуйста, используйте Android или iOS устройство для установки PWA.</p>
                    )}

                    <Button onClick={() => { router.back() }} text='Назад' stretch />
                </div>
            </main>
        </>
    )
}

export default InstallGuide
