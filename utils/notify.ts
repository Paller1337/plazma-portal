import { notifications } from '@mantine/notifications'

export const notify = ({
    title,
    message,
    icon
}) => {
    console.log('Notify!')
    return notifications.show({
        position: 'top-center',
        withCloseButton: true,
        // onClose: () => console.log('unmounted'),
        // onOpen: () => console.log('mounted'),
        autoClose: 3000,
        title,
        message,
        radius: 'lg',
        withBorder: true,
        color: 'rgb(86, 117, 75)',
        icon: icon,
        style: { backgroundColor: '#fff', border: '1px solid rgb(86, 117, 75)' },
        loading: false,
    })
};