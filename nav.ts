export namespace NAV {
    export const menuItems = [
        {
            label: 'Гостевой портал',
            links: [
                { label: 'Заказы', path: '/admin/portal/orders', roles: ['admin', 'moderator'] },
                { label: 'Поддержка', path: '/admin/portal/tickets', roles: ['admin'] },
                { label: 'Гости', path: '/admin/portal/guests', roles: ['admin', 'moderator'] },
            ],
            icon: 'nav_users',
            notification: 0,
            roles: ['admin', 'moderator']
        },
        {
            label: 'Управление банкетами',
            path: '/admin/banquet-management',
            icon: 'nav_order',
            notification: 0,
            roles: ['admin', 'banquet']
        },
        {
            label: 'Настройки',
            path: '/admin/settings',
            icon: 'nav_settings',
            notification: 0,
            roles: ['admin']
        },
    ]
}
