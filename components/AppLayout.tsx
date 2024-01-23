import { useRouter } from 'next/router'
import Footer from './Footer'
import Header from './Header'
import { useContext, useEffect, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import NavBar from './NavBar'
import { DEFAULTS } from 'defaults'
import { io } from 'socket.io-client'
import { SECRET_KEY, decodeToken } from 'helpers/login'
import { useAuth } from 'context/AuthContext'
import { checkOrderStatus } from 'helpers/order/order'
import { GetServerSideProps } from 'next'

interface AppLayoutProps {
    children: React.ReactNode | React.ReactPortal
    asPath: string
    pageProps: any
}




export default function AppLayout(props: AppLayoutProps): JSX.Element {
    const { isAuthenticated } = useAuth()

    return (<>
        <div className='wrapper' data-barba="wrapper">
            <Header />
            {props.children}
            <Footer />
        </div >
    </>)
}