import { useRouter } from 'next/router'
import Footer from './Footer'
import Header from './Header'
import { useContext, useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import NavBar from './NavBar'

interface AppLayoutProps {
    children: React.ReactNode | React.ReactPortal
    asPath: string
    pageProps: any
}

export default function AppLayout(props: AppLayoutProps): JSX.Element {

    return (<>
        <div className='wrapper' data-barba="wrapper">
            <Toaster />
            <Header />
            {props.children}
            <Footer />
        </div >
    </>)
}