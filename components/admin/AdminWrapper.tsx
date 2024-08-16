import { useAuth } from 'context/admin/AuthContext';
import { useAdminOrders } from 'context/admin/OrderContext';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ReactSVG } from 'react-svg';

const menuItems = [
    {
        label: 'Гостевой портал',
        links: [
            { label: 'Заказы', path: '/admin/portal/orders' },
            { label: 'Товары и услуги', path: '/admin/portal/products-services' },
            { label: 'Гости', path: '/admin/portal/guests' },
        ],
        icon: 'nav_users',
        notification: 0,
    },
    {
        label: 'Управление банкетами',
        path: '/admin/banquet-management',
        icon: 'nav_order',
        notification: 4,
    },
    {
        label: 'Спортивные мероприятия',
        path: '/admin/sports-events',
        icon: 'nav_sport',
        notification: 0,
    }
];

export const getServerSideProps: GetServerSideProps = async (context) => {
    return {
        props: {}
    };
}

interface AdminWrapperProps {
    children?: React.ReactNode
    navIsVisible?: boolean
}

export default function AdminWrapper(props: AdminWrapperProps) {
    const router = useRouter()
    const { logOut } = useAuth()
    const [isMenuMin, setIsMenuMin] = useState(false)
    const [openSections, setOpenSections] = useState({})
    const [activeIndex, setActiveIndex] = useState(-1)
    const { clients } = useAdminOrders()

    const toggleMin = () => setIsMenuMin(p => !p)

    useEffect(() => {
        document.getElementById('__next').classList.add('admin-wrapper');

        // Set active index based on the current route
        menuItems.forEach((item, index) => {
            if (item.path && router.pathname.startsWith(item.path)) {
                setActiveIndex(index);
            } else if (item.links) {
                item.links.forEach((link) => {
                    if (router.pathname.startsWith(link.path)) {
                        setActiveIndex(index);
                        setOpenSections((prevState) => ({ ...prevState, [index]: true }));
                    }
                });
            }
        });
    }, [router.pathname]);

    const toggleSection = (index) => {
        setOpenSections((prevState) => ({
            ...prevState,
            [index]: !prevState[index],
        }));
    };

    return (
        <main className='admin-main'>
            {props.navIsVisible ?
                <div className={`admin-nav${isMenuMin ? ' min' : ''}`}>
                    {/* HEADER NAV*/}
                    <div className='admin-nav__header'>
                        <div className='admin-nav__header-content'>
                            <ReactSVG className='admin-nav__header-logo' src='/svg/logo-white-48.svg' onClick={() => toggleMin()} />
                            {!isMenuMin ?
                                <>
                                    <span className='admin-nav__header-hs' />
                                    <div className='admin-nav__header-info'>
                                        <span className='admin-nav__header-title'>Панель администратора</span>
                                        <span className='admin-nav__header-partition'>
                                            {menuItems[activeIndex]?.label || 'Управление'}
                                        </span>
                                    </div>
                                </>
                                : <></>}
                        </div>
                        <span className='admin-nav__vs' />
                    </div>

                    {/* MAIN NAV */}
                    <div className='admin-nav__menu'>
                        {menuItems.map((item, index) => {
                            const isSectionOpen = openSections[index] || false;
                            const sectionIsActive = item.links
                                ? item.links.some(link => router.pathname.startsWith(link.path))
                                : router.pathname.startsWith(item.path);

                            if (item.links) {
                                return (
                                    <div key={index} className={`admin-nav__menu-section ${sectionIsActive ? 'active' : ''}`}>
                                        <div className={`admin-nav__menu-section-header ${sectionIsActive ? 'active' : ''}`} onClick={() => toggleSection(index)}>
                                            <ReactSVG className='admin-nav__menu-section-logo' src={`/svg/admin/${item.icon}${sectionIsActive ? '-dark' : ''}.svg`} />
                                            {!isMenuMin ?
                                                <>
                                                    <span>{item.label}</span>
                                                    <ReactSVG className={`admin-nav__menu-section-toggle ${isSectionOpen ? 'open' : ''}`} src={`/svg/admin/nav_angle${sectionIsActive ? '-dark' : ''}.svg`} />
                                                </>
                                                : <></>}
                                        </div>
                                        {!isMenuMin && isSectionOpen ?
                                            <div className='admin-nav__menu-section-links'>
                                                {item.links.map((link, idx) => (
                                                    <a key={idx} href={link.path} className={`admin-nav__menu-link ${router.pathname.startsWith(link.path) ? 'active' : ''}`}>
                                                        {link.label}
                                                    </a>
                                                ))}
                                            </div>
                                            : <></>}
                                    </div>
                                );
                            } else {
                                return (
                                    <a key={index} href={item.path} className={`admin-nav__menu-item ${sectionIsActive ? 'active' : ''}`}>
                                        <ReactSVG className='admin-nav__menu-item-icon' src={`/svg/admin/${item.icon}${sectionIsActive ? '-dark' : ''}.svg`} />
                                        {!isMenuMin ?
                                            <>
                                                <span>{item.label}</span>
                                                {item.notification && item.notification > 0 ? (
                                                    <span className='admin-nav__menu-item-badge'>{item.notification}</span>
                                                ) : null}
                                            </>
                                            : <></>}
                                    </a>
                                );
                            }
                        })}
                    </div>
                    {/* FOOTER NAV */}
                    {/* {clients?.count ? 'Онлайн: ' + clients?.count : ''} */}

                    <div className='admin-nav__footer'>
                        <span className='admin-nav__vs' />
                        <div className='admin-nav__footer-content'>
                            <a className={`admin-nav__footer-item`} onClick={logOut}>
                                <ReactSVG className='admin-nav__footer-item-icon' src={`/svg/admin/nav_logout.svg`} />
                                {!isMenuMin ?
                                    <>
                                        <span>Выйти из аккаунта</span>
                                    </>
                                    : <></>}
                            </a>
                        </div>
                    </div>
                </div>
                :
                <></>
            }

            <div className='admin-page'>
                {props.children}
            </div>
        </main>
    )
}
