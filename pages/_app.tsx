import '../styles/app.sass'
import 'swiper/css'
import 'swiper/css/bundle'
// import "aos/dist/aos.css"

import type { AppProps } from 'next/app'
import React, { useContext, useEffect, useRef, useState } from 'react'

import Head from 'next/head'
import { useRouter } from 'next/router'
import LoadingBar, { LoadingBarRef } from 'react-top-loading-bar'
import AppLayout from '@/components/AppLayout'
import { CartProvider } from 'context/CartContext'


export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter()
    const loaderRef = useRef<LoadingBarRef>(null)

    useEffect(() => {
        router.events.on('routeChangeStart', () => {
            loaderRef.current?.continuousStart()
        })

        router.events.on('routeChangeComplete', () => {
            loaderRef.current?.complete()
        })
    }, [router.asPath, router.events])

    return (
        <>
            <Head>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <LoadingBar color='#262626' ref={loaderRef} height={2} />

            <CartProvider>
                <AppLayout asPath={router.asPath} pageProps={pageProps}>
                    <Component {...pageProps} />
                </AppLayout>
            </CartProvider>
        </>
    )
}


