'use client'

import { Loader, Stack } from '@mantine/core';
// import { ModalsProvider } from '@mantine/modals'
import dynamic from 'next/dynamic';

const ModalsProvider = dynamic(() =>
    import('@mantine/modals')
        .then(mod => mod.ModalsProvider),
    {
        loading: () => <Stack justify='center' align='center' left={0} right={0} top={0} bottom={0} pos={'absolute'}><Loader size={30} /></Stack>,
        ssr: false
    })

interface ClientProviderLayoutProps {
    children: React.ReactNode;
}

export default function ClientProviderLayout({ children }: ClientProviderLayoutProps) {

    return (
        <ModalsProvider>
            {children}
        </ModalsProvider>
    )
}