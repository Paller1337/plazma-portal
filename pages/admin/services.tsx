import ServiceOrder from '@/components/admin/ServiceOrder';
import { Flex, Stack } from '@mantine/core';
import { useState } from 'react';

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
export default function AdminServicesPage() {
    const [currentNav, setCurrentNav] = useState(1)

    const navItems = [
        { id: 1, name: 'Новые', count: 6 },
        { id: 2, name: 'Завершенные', count: 2 },
        { id: 3, name: 'Ожидают', count: 17 }
    ]

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
                    <ServiceOrder />
                </Flex>
            </main>
        </>
    );
}