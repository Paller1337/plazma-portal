
import { useState } from 'react';
import Modal from 'react-modal'
import { useRouter } from 'next/router';
import { Menu, rem, Text, LoadingOverlay } from '@mantine/core'
import { IconBackspace, IconTrash } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { Reserve } from 'helpers/iiko/IikoApi/types';
import { IReserveByPortal } from 'types/admin/banquets';
import { title } from 'process';
import { deleteBanquet, recoverBanquet, recreateBanquet } from 'helpers/banquets/db';
import { useDisclosure } from '@mantine/hooks';


const openConfirmModal = ({ title, text, onCall, isDeleting }) =>
    modals.openConfirmModal({
        title: title,
        children: (
            <Text>
                {text}
            </Text>
        ),
        labels: { confirm: isDeleting ? 'Удалить' : 'Восстановить', cancel: 'Отмена' },
        confirmProps: { color: isDeleting ? 'red' : 'green', variant: 'filled' },
        onConfirm: () => onCall(),
    });

const openStatusChangeConfirmModal = (status, onCall) =>
    modals.openConfirmModal({
        title: `Банкет ${status === 'recreate' ? 'пересоздан' : status === 'restore' ? 'восстановлен' : 'удален'}.`,
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

export default function DeleteButton(props: { data: Reserve | IReserveByPortal, type?: 'iiko' | 'portal', onStatusChanged?: (action: 'isDeleted' | 'status') => void }) {
    const id = props.type === 'iiko'
        ? (props.data as Reserve).id
        : (props.data as IReserveByPortal).id

    const router = useRouter()
    const [visible, { open, close }] = useDisclosure(false)


    if (props.type === 'iiko') {
        return (<>
            <Menu.Item
                color="red"
                leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                onClick={() => openConfirmModal({
                    title: 'Вы точно хотите удалить этот банкет?',
                    text: `Вы точно хотите удалить банкет ${id}?`,
                    onCall: () => { },
                    isDeleting: true,
                })}
            >
                Удалить банкет
            </Menu.Item>
        </>)
    } else {
        const isDeleted = (props.data as IReserveByPortal).isDeleted
        const isSent = (props.data as IReserveByPortal).status === 'sent'

        return (<>
            <LoadingOverlay visible={visible} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
            {isDeleted ?
                <Menu.Item
                    color="green"
                    leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                    onClick={() => openConfirmModal({
                        title: 'Вы точно хотите восстановить этот банкет?',
                        text: `Вы точно хотите восстановить банкет ${id}?`,
                        onCall: () => {
                            open()
                            recoverBanquet(id)
                                .finally(() => {
                                    close()
                                    props.onStatusChanged('isDeleted')
                                    openStatusChangeConfirmModal('restore', () => router.push('/admin/banquet-management', null, { shallow: true }))
                                })
                        },
                        isDeleting: false
                    })}
                >
                    Отменить удаление
                </Menu.Item>
                :
                <Menu.Item
                    color="red"
                    leftSection={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
                    onClick={() => openConfirmModal({
                        title: 'Вы точно хотите удалить этот банкет?',
                        text: `Вы точно хотите удалить банкет ${id}?`,
                        onCall: () => {
                            open();
                            deleteBanquet(id).finally(() => {
                                close();
                                props.onStatusChanged('isDeleted');
                                openStatusChangeConfirmModal('delete', () => router.push('/admin/banquet-management', null, { shallow: true }))
                            })
                        },
                        isDeleting: true,
                    })}
                >
                    Удалить банкет
                </Menu.Item>
            }
            {isSent ? //Добавить восстановление банкета
                <Menu.Item
                    color="green"
                    leftSection={<IconBackspace style={{ width: rem(14), height: rem(14) }} />}
                    onClick={() => openConfirmModal({
                        title: 'Вы точно хотите восстановить этот банкет?',
                        text: `Вы точно хотите восстановить банкет ${id}?`,
                        onCall: () => {
                            open()
                            recreateBanquet(id)
                                .finally(() => {
                                    close()
                                    props.onStatusChanged('status')
                                    openStatusChangeConfirmModal('recreate', () => router.push('/admin/banquet-management', null, { shallow: true }))
                                })
                        },
                        isDeleting: false
                    })}
                >
                    Вернуть
                </Menu.Item> : <></>}
        </>)
    }

    // return (<>
    {/* <Modal
            isOpen={isModalOpen}
            onRequestClose={e => {
                e.stopPropagation()
                closeModal()
            }}
            className={'json-del-btn-modal'}
            ariaHideApp={false}
        >
            <div style={{ maxWidth: 250, display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 24, fontWeight: 500 }}>Удалить?</span>
                <div className='row'>
                    <Button className='mt-3 ml-3 mb-3' style={{ background: `#f23`, width: 100, height: 44 }} onClick={e => {
                        e.stopPropagation()
                        deleteBanquet()
                    }}>Да</Button>
                    <Button className='mt-3 ml-3 mb-3' style={{ background: `green`, width: 100, height: 44 }} onClick={e => {
                        e.stopPropagation()
                        closeModal()
                    }}>Нет</Button>
                </div>
            </div>
        </Modal> */}

    {/* <Modal
            isOpen={isModalRecoverOpen}
            onRequestClose={e => {
                e.stopPropagation()
                closeRecoverModal()
            }}
            className={'json-del-btn-modal'}
            ariaHideApp={false}
        >
            <div style={{ maxWidth: 250, display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 24, fontWeight: 500 }}>Восстановить?</span>
                <div className='row'>
                    <Button className='mt-3 ml-3 mb-3' style={{ background: `green`, width: 100, height: 44 }} onClick={e => {
                        e.stopPropagation()
                        recoverBanquet()
                    }}>Да</Button>
                    <Button className='mt-3 ml-3 mb-3' style={{ background: `#f23`, width: 100, height: 44 }} onClick={e => {
                        e.stopPropagation()
                        closeRecoverModal()
                    }}>Нет</Button>
                </div>
            </div>
        </Modal> */}
}