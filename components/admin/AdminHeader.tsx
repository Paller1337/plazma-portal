import { useEffect, useState } from 'react'
import { Container, Group, Burger } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { ReactSVG } from 'react-svg'
import Link from 'next/link'
import Router from 'next/router'

const links = [
    // { link: '/admin', label: 'Главная' },
    // { link: '/admin/eat', label: 'Заказы еды' },
    { link: '/admin/services', label: 'Заказы услуг' },
    { link: '/admin/support', label: 'Запросы на поддержку' },
    // { link: '/admin/settings', label: 'Настройки' },
];

export default function AdminHeader() {
    const [opened, { toggle }] = useDisclosure(false);
    const [active, setActive] = useState(links[0].link);

    const items = links.map((link) => (
        <Link
            key={link.label}
            href={link.link}
            className={'admin-header__link'}
            data-active={active === link.link || undefined}
            onClick={(event) => {
                setActive(link.link)
            }}
        >
            {link.label}
        </Link>
    ))

    useEffect(() => {
        console.log(Router.pathname)
        setActive(Router.pathname)
    }, [])
    return (
        <header className={'admin-header'}>
            <div className={'admin-header__inner'}>
                <div className='header__logo'>
                    <ReactSVG src='/svg/logo-white.svg'></ReactSVG>
                </div>
                <Group gap={5} visibleFrom="xs">
                    {items}
                </Group>

                {/* <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" /> */}
            </div>
        </header>
    )
}