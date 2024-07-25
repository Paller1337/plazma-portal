import '../styles/app.sass'
import 'swiper/css'
import 'swiper/css/bundle'
// import "aos/dist/aos.css"
import '@mantine/core/styles.css'

import React, { useEffect, useRef } from 'react'

import Head from 'next/head'
import { useRouter } from 'next/router'
import LoadingBar, { LoadingBarRef } from 'react-top-loading-bar'
import AppLayout from '@/components/AppLayout'
import { CartProvider } from 'context/CartContext'
import { AuthProvider } from 'context/AuthContext'
import { AuthProvider as AdminAuthProvider } from 'context/admin/AuthContext'
import { Button, MantineProvider, createTheme } from '@mantine/core'
import AdminHeader from '@/components/admin/AdminHeader'
import { Toaster } from 'react-hot-toast'
import { OrderProvider as AdminOrderProvider } from 'context/admin/OrderContext'
import { OrderProvider } from 'context/OrderContext'
import AdminWrapper from '@/components/admin/AdminWrapper'


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
                <AdminAuthProvider>
                    <AdminOrderProvider>
                        <Toaster />
                        {/* <AdminHeader /> */}
                        <AdminWrapper navIsVisible={!router.asPath.includes('/login')}>
                            <Component {...pageProps} />
                        </AdminWrapper>
                    </AdminOrderProvider>
                </AdminAuthProvider>
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
                    <OrderProvider>
                        <CartProvider>
                            <AppLayout asPath={router.asPath} pageProps={pageProps}>
                                <Toaster />
                                <Component {...pageProps} />
                            </AppLayout>
                        </CartProvider>
                    </OrderProvider>
                </AuthProvider>
            </MantineProvider>
        </>
    )
}


