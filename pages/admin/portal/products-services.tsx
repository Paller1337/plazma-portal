import AdminWrapper from '@/components/admin/AdminWrapper'
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
            <div className='admin--products'> {/* На данный момент стилей нет */}
               Гости
            </div>
        </>
    )
}