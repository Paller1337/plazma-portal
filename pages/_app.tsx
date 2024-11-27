import '../styles/app.sass'
import 'swiper/css'
import 'swiper/css/bundle'
// import "aos/dist/aos.css"
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/carousel/styles.css'
import 'react18-json-view/src/style.css'

import React, { useEffect, useRef } from 'react'

import Head from 'next/head'
import { useRouter } from 'next/router'
import LoadingBar, { LoadingBarRef } from 'react-top-loading-bar'
import AppLayout from '@/components/AppLayout'
import { CartProvider } from 'context/CartContext'
import { AuthProvider } from 'context/AuthContext'
import { AuthProvider as AdminAuthProvider } from 'context/admin/AuthContext'
import { Text, Group, MantineProvider, Paper, Stack } from '@mantine/core'
import AdminHeader from '@/components/admin/AdminHeader'
import { Toaster } from 'react-hot-toast'
import { OrderProvider as AdminOrderProvider } from 'context/admin/OrderContext'
import { OrderProvider } from 'context/OrderContext'
import AdminWrapper from '@/components/admin/AdminWrapper'
import { plazmaTheme, resolver } from '../theme'
import { DatesProvider } from '@mantine/dates'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import { ModalsProvider } from '@mantine/modals'
import { IikoProvider } from 'context/IikoContext'
import dynamic from 'next/dynamic'
import { FaGear } from 'react-icons/fa6'
// import { Notifications } from '@mantine/notifications'
import { YMInitializer } from 'react-yandex-metrika'

const Notifications = dynamic(() => import('@mantine/notifications').then((mod) => mod.Notifications), { ssr: false });

export default function App({ Component, pageProps }) {

    return (<>
        <MantineProvider cssVariablesResolver={resolver} defaultColorScheme='light' theme={plazmaTheme}>
            <YMInitializer
                accounts={[99000096]}
                options={{ trackLinks: true, clickmap: true }}
                version='2'
            />
            <Notifications
                style={{
                    position: 'fixed', top: 0, left: '50%', right: 0,
                    zIndex: 99999,
                    padding: '12px',
                    maxWidth: '650px',
                    transform: 'translateX(-50%)',
                    width: '100%'
                }} />
            <DatesProvider settings={{ locale: dayjs.locale('ru') }}>
                <AppPart pageProps={pageProps}>
                    <Component {...pageProps} />
                </AppPart>
            </DatesProvider>
        </MantineProvider>
    </>)
}


const AppPart = ({ pageProps, children }) => {
    const router = useRouter()
    const loaderRef = useRef<LoadingBarRef>(null)

    useEffect(() => {
        // Логика для путей, отличных от админ-панели
        if (!router.pathname.startsWith('/admin')) {
            router.events.on('routeChangeStart', () => {
                loaderRef.current?.continuousStart();
            })

            router.events.on('routeChangeComplete', () => {
                loaderRef.current?.complete();
            })
        }
    }, [router])

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/worker.js')
                .then(registration => console.log('Service Worker зарегистрирован:', registration))
                .catch(error => console.error('Ошибка регистрации Service Worker:', error));
        }
    }, [])

    useEffect(() => console.log({ pageProps }), [pageProps])
    if (router.pathname.startsWith('/admin')) {
        // Рендеринг админ-панели без контекстов
        return (<>
            <AdminAuthProvider>
                <AdminOrderProvider>
                    <IikoProvider>
                        <Toaster />
                        {/* <AdminHeader /> */}
                        <AdminWrapper navIsVisible={!router.asPath.includes('/login') && !router.asPath.includes('/rest')} role={pageProps?.guestRole}>
                            {children}
                        </AdminWrapper>
                    </IikoProvider>
                </AdminOrderProvider>
            </AdminAuthProvider>
        </>)
    }

    return (
        <>

            <Head>
                <link rel="icon" href="/favicon.ico" />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
            </Head>

            <LoadingBar color='#262626' ref={loaderRef} height={2} />
            {pageProps?.settings?.isDisable
                ?
                <Stack h={'100vh'} w={'100vw'} align='center' justify='center'>
                    <Paper mt={12} radius={'md'} p={12} style={{ border: '1px solid rgb(86, 117, 75)' }}>
                        <Group gap={12} wrap='nowrap'>
                            <Stack
                                bg={'rgb(86, 117, 75)'}
                                p={6}
                                style={{ borderRadius: 32 }}
                                justify='center'
                                align='center'
                            >
                                <FaGear size={18} color='white' />
                            </Stack>
                            <Text fz={15} fw={500}>Ведутся технические работы</Text>
                        </Group>
                    </Paper>
                </Stack>
                :
                <AuthProvider>
                    <OrderProvider>
                        <CartProvider>
                            <AppLayout asPath={router.asPath} pageProps={pageProps}>
                                {children}
                            </AppLayout>
                        </CartProvider>
                    </OrderProvider>
                </AuthProvider>
            }
        </>
    )
}