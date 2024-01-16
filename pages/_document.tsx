import { Html, Head, Main, NextScript } from 'next/document'
import { useEffect } from 'react';
declare global {
    interface Window {
        travelline: any
        TL: any
    }
}



export default function Document() {
    return (
        <>
            <Html>
                <Head>
                    <link rel='preconnect' href='https://fonts.googleapis.com' />
                    <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
                    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
                </Head>
                <body className='body'>
                    <Main />
                    <NextScript />
                </body>
            </Html >
        </>
    )
}
