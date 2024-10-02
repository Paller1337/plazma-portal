import React from 'react';

export function withAdminPage<P>(Component: React.ComponentType<P>) {
    return function AdminPageWrapper(props: P & { isAllowed: boolean }) {
        const { isAllowed, ...restProps } = props;
        console.log('with admin Props: ', { props })
        if (isAllowed) {
            return (
                <Component {...(restProps as P)} />
            )
        } else {
            return (
                <div>У вас нет доступа к этой странице.</div>
            )
        }
    };
}
