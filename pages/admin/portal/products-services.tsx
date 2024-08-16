import AdminWrapper from '@/components/admin/AdminWrapper'
import HelpDesk from '@/components/admin/HelpOrder'
import ServiceOrder from '@/components/admin/ServiceOrder'
import { Grid, Input, SegmentedControl } from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import { useAdminOrders } from 'context/admin/OrderContext'
import { getRooms } from 'helpers/bnovo/getRooms'
import { withAdminAuthServerSideProps } from 'helpers/withAdminAuthServerSideProps'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next/types'
import { useEffect, useState } from 'react'
import { TOrderStatus } from 'types/order'


interface ProductsServicesPageProps {
    rooms?: any
}

export const getServerSideProps: GetServerSideProps = withAdminAuthServerSideProps(async (context) => {
    try {
        const rooms = await getRooms()

        if (!rooms) {
            throw new Error(`Комнат нет`)
        }
        return {
            props: {
                rooms: rooms,
            }
        };
    } catch (error) {
        console.error('Ошибка:', error);
        return { props: { orders: [], rooms: [] } };
    }
}, ['admin'])

export default function ProductsServicesPage(props: ProductsServicesPageProps) {
    const router = useRouter()


    return (
        <>
            <div className='admin--order'> {/* На данный момент стилей нет */}
                <div className='admin--order__header'>
                    <div className='admin--order__header-content'>
                        <span className='admin--order__header-title'>Запросы на сегодня</span>
                        <div className='admin--order__header-filters'>
                            <SegmentedControl
                                color="#262E4A"
                                radius={'md'}
                                size='md'
                                data={[
                                    { label: 'React', value: 'react' },
                                    { label: 'Angular', value: 'ng' },
                                    { label: 'Vue', value: 'vue' },
                                    { label: 'Svelte', value: 'svelte' },
                                ]}
                            />
                            <Input
                                placeholder="Поиск..."
                                rightSection={<IconSearch size={16} />}
                                radius={'md'}
                                size='md'
                            />
                        </div>
                    </div>
                    <div className='admin-main__vs' />
                </div>


                <Grid px={24}>
                    <HelpDesk />
                </Grid>
            </div>
        </>
    )
}