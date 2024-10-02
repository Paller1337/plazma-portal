import { Button, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useRouter } from 'next/router';

interface BanquetTransportToIikoButtonProps {
    onClick: () => void;
}


const openSaveConfirmModal = (onCall) =>
    modals.openConfirmModal({
        title: 'Передача заказа на IIKO Front.',
        children: (
            <Text inline>
                Вы точно хотите передать банкет в iiko?
            </Text>
        ),
        labels: { confirm: 'Да', cancel: 'Нет' },
        confirmProps: { color: 'green', variant: 'filled', py: 12, h: 42 },
        cancelProps: { color: 'blue', variant: 'outline', py: 12, h: 42 },
        onConfirm: () => {
            onCall()
        },
    });

export default function BanquetTransportToIikoButton({ onClick }: BanquetTransportToIikoButtonProps) {
    const router = useRouter()

    return (
        <Button color='#ff5252' onClick={() => {
            openSaveConfirmModal(() => onClick())
        }} ml='12px' variant='filled' size='md' radius={'md'}>Передать в IIKO</Button>
    )
}