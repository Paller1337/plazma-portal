import ServiceOrder from '@/components/admin/ServiceOrder';
import { Flex, Stack } from '@mantine/core';
import { getRooms } from 'helpers/bnovo/getRooms';
import { getServiceOrders } from 'helpers/order/services';
import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import { IService, IServiceOrder, IServiceOrdered } from 'types/services';




interface AdminServicesPageProps {
    services?: IServiceOrder[]
    rooms?: any
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    try {
        const res = await getServiceOrders()
        if (!res) {
            throw new Error(`Заказов нет`)
        }
        console.log(res[0])
        const services: IServiceOrder[] = res.map(x => {
            const orderData: IServiceOrdered[] = x.attributes.order.map(item => (
                {
                    quantity: item.quantity,
                    service: {
                        attributes: {
                            title: item.service.data.attributes.title,
                            price: item.service.data.attributes.price,
                            images: {
                                data: item.service.data.attributes.images.data,
                            }
                        }
                    }
                } as IServiceOrdered
            ))
            return (
                {
                    status: x.attributes.orderInfo.status,
                    room: x.attributes.orderInfo.customer.room,
                    customer: x.attributes.orderInfo.customer.name,
                    comment: x.attributes.orderInfo.description,
                    phone: x.attributes.orderInfo.customer.phone,
                    paymentType: 'cash',
                    order: orderData,
                } as IServiceOrder
            )
        })

        const rooms = await getRooms()

        return {
            props: {
                services: services,
                rooms: rooms,
            } as AdminServicesPageProps
        }
    } catch (error) {
        console.error('Ошибка при получении услуг:', error)
        return {
            props: {
                services: []
            } as AdminServicesPageProps
        }
    }
}
interface PageNavItemProps {
    isActive?: boolean
    name: string
    count: number
    onClick?: () => void
}

const PageNavItem = (props: PageNavItemProps) => {

    return (
        <div className={`admin-page--pageNav__item ${props.isActive ? 'active' : ''}`}
            onClick={props.onClick}>

            {props.name}
            <div className='admin-page--pageNav__item-counter'>{props.count}</div>
        </div>
    )
}

export default function AdminServicesPage(props: AdminServicesPageProps) {
    const [currentNav, setCurrentNav] = useState(1)

    const navItems = [
        { id: 1, name: 'Новые', count: 6 },
        { id: 2, name: 'Завершенные', count: 2 },
        { id: 3, name: 'Ожидают', count: 17 }
    ]


    const hotelRooms = props.rooms.filter(x => x.tags !== '')
    useEffect(() => {
        console.log("Список комнат: \n", props.services)
    }, [hotelRooms])
    return (
        <>
            <main className='admin-page'>
                <Flex
                    direction={'column'}
                    gap={12}
                >
                    <div className='admin-page--pageNav'>
                        {navItems.map(x =>
                            <PageNavItem
                                key={x.name}
                                count={x.count}
                                name={x.name}
                                isActive={currentNav === x.id}
                                onClick={() => setCurrentNav(x.id)}
                            />
                        )}
                    </div>

                    <div className='admin-serviceCards'>
                        {props.services.map((service, i) => {
                            const serviceRoom = hotelRooms.find(x => x.id === service.room)?.tags
                            console.log('Заказ ', service.customer, 'Комната: ', serviceRoom)
                            return (
                                <ServiceOrder
                                    key={i + serviceRoom + service.comment}
                                    status={service.status}
                                    comment={service.comment}
                                    customer={service.customer}
                                    phone={service.phone}
                                    room={serviceRoom}
                                    paymentType={service.paymentType}
                                    paymentAmount={1000}
                                    order={service.order}
                                />
                            )
                        })}
                    </div>
                </Flex>
            </main>
        </>
    );
}