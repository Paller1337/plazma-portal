import { Html, Head, Main, NextScript } from 'next/document'
import { useEffect } from 'react'
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
                    <link rel='manifest' href='/manifest.json' />
                </Head>
                <body className='body no-scrollbar'>
                    <Main />
                    <NextScript />
                    {/* <script dangerouslySetInnerHTML={{
                        __html:
                            `
                        if ('serviceWorker' in navigator) {
                            navigator.serviceWorker.register('/worker.js')
                                .then(function (registration) {
                                    console.log('Service Worker зарегистрирован с областью:', registration.scope);
                                })
                                .catch(function (error) {
                                    console.log('Ошибка регистрации Service Worker:', error);
                                });
                        }
                        `
                    }}>

                    </script> */}
                </body>
            </Html >
        </>
    )
}
