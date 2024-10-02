import { Button, LoadingOverlay, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { useRouter } from 'next/router';

interface BanquetSaveButtonProps {
    onClick: () => void;
}


const openSaveConfirmModal = (onCall) =>
    modals.openConfirmModal({
        title: 'Банкет сохранен.',
        children: (
            <Text inline>

            </Text>
        ),
        labels: { confirm: 'К списку банкетов', cancel: 'Остаться' },
        confirmProps: { color: 'green', variant: 'filled', py: 12, h: 42 },
        cancelProps: { color: 'blue', variant: 'outline', py: 12, h: 42 },
        onConfirm: () => {
            onCall()
        },
    });

export default function BanquetSaveButton({ onClick }: BanquetSaveButtonProps) {
    const router = useRouter()
    const [isOverlay, overlay] = useDisclosure(false)

    return (
        <>
            <LoadingOverlay visible={isOverlay} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
            <Button color='green' onClick={() => {
                onClick()
                openSaveConfirmModal(() => {
                    overlay.open()
                    router.push('/admin/banquet-management', null, { shallow: true })
                        .finally(() => overlay.close)
                })
            }} ml='12px' variant='filled' size='md' radius={'md'}>Сохранить</Button>
        </>
    )
}