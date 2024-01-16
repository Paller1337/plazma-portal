import '../styles/app.sass'
import 'swiper/css'
import 'swiper/css/bundle'
// import "aos/dist/aos.css"
import '@mantine/core/styles.css'

import type { AppProps } from 'next/app'
import React, { useContext, useEffect, useRef, useState } from 'react'

import Head from 'next/head'
import { useRouter } from 'next/router'
import LoadingBar, { LoadingBarRef } from 'react-top-loading-bar'
import AppLayout from '@/components/AppLayout'
import { CartProvider } from 'context/CartContext'
import { AuthProvider } from 'context/AuthContext'
import { Button, MantineProvider, createTheme } from '@mantine/core'
import AdminHeader from '@/components/admin/AdminHeader'
import { Toaster } from 'react-hot-toast'


const theme = createTheme({
    components: {
        Button: Button.extend({
            defaultProps: {
                color: 'cyan',
                variant: 'outline',
                py: 12,
            },
        }),
    },
})

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();
    const loaderRef = useRef<LoadingBarRef>(null);

    useEffect(() => {
        // Логика для путей, отличных от админ-панели
        if (!router.pathname.startsWith('/admin')) {
            router.events.on('routeChangeStart', () => {
                loaderRef.current?.continuousStart();
            });

            router.events.on('routeChangeComplete', () => {
                loaderRef.current?.complete();
            });
        }
    }, [router]);

    if (router.pathname.startsWith('/admin')) {
        // Рендеринг админ-панели без контекстов
        return (<>
            <MantineProvider theme={theme}>
                <Toaster />
                <AdminHeader />
                <Component {...pageProps} />
            </MantineProvider>
        </>)
    }
    return (
        <>
            <Head>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <LoadingBar color='#262626' ref={loaderRef} height={2} />


            <MantineProvider theme={theme}>
                <AuthProvider>
                    <CartProvider>
                        <AppLayout asPath={router.asPath} pageProps={pageProps}>
                            <Component {...pageProps} />
                        </AppLayout>
                    </CartProvider>
                </AuthProvider>
            </MantineProvider>
        </>
    )
}


