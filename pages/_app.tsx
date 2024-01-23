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
import jwt, { JwtPayload } from 'jsonwebtoken'
import { GetServerSideProps } from 'next'
import { SECRET_KEY } from 'helpers/login'


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


// export const getServerSideProps: GetServerSideProps = async (context) => {
//     const token = context.req.headers.cookie?.split('; ').find(c => c.startsWith('session_token='))?.split('=')[1];
//     let isAuthenticated = true;

//     // if (token) {
//     //     try {
//     //         jwt.verify(token, SECRET_KEY);
//     //         isAuthenticated = true;
//     //     } catch (error) {
//     //         // Обработка ошибки, если токен недействителен
//     //     }
//     // }

//     return {
//         props: { isAuthenticated },
//     };
// };


export default function App({ Component, pageProps }) {
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
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
            </Head>

            <LoadingBar color='#262626' ref={loaderRef} height={2} />


            <MantineProvider theme={theme}>
                <AuthProvider>
                    <CartProvider>
                        <Toaster />
                        <AppLayout asPath={router.asPath} pageProps={pageProps}>
                            <Component {...pageProps} />
                        </AppLayout>
                    </CartProvider>
                </AuthProvider>
            </MantineProvider>
        </>
    )
}


