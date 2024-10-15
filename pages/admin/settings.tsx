import { Button, Grid, Input, Loader, LoadingOverlay, SegmentedControl, Stack } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useAdminOrders } from 'context/admin/OrderContext'
import { getRooms } from 'helpers/bnovo/getRooms'
import { deleteCachedKeysByPattern } from 'helpers/redis'
import { withAdminAuthServerSideProps } from 'helpers/withAdminAuthServerSideProps'
import { withAdminPage } from 'helpers/withAdminPage'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next/types'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { TOrderStatus } from 'types/order'
import { ISupportTicket, TSupportTicketStatus } from 'types/support'


export const getServerSideProps: GetServerSideProps = withAdminAuthServerSideProps(async (context) => {
    try {
        const rooms = await getRooms()

        if (!rooms) {
            throw new Error(`Комнат нет`)
        }
        return {
            props: {
                rooms: rooms,
            }
        };
    } catch (error) {
        console.error('Ошибка:', error);
        return { props: { orders: [], rooms: [] } };
    }
}, ['admin'])


function SettingsPage(props) {
    const [currentNav, setCurrentNav] = useState<TSupportTicketStatus>('new')
    const router = useRouter()
    const { state } = useAdminOrders()
    const [tickets, setTickets] = useState(state.tickets)

    const query = router.query
    const nowDate = DateTime.now()

    const [isOverlayL, overlayL] = useDisclosure(false)

    const clearCache = async (t) => {
        overlayL.open()
        await deleteCachedKeysByPattern(t)
            .then(r => console.log('clearCache: ', r))
            .finally(() => {
                overlayL.close()
                toast.success('Кэш очищен')
            })
    }

    return (
        <>
            <LoadingOverlay visible={isOverlayL} />
            <div className='admin--order'> {/* На данный момент стилей нет */}
                <div className='admin--order__header'>
                    <div className='admin--order__header-content'>
                        <span className='admin--order__header-title'>Настройки</span>
                        <div className='admin--order__header-filters'>

                        </div>
                    </div>
                    <div className='admin-main__vs' />
                </div>

                <Grid p={24}>
                    <Grid.Col span={3}>
                        <Stack gap={32}>
                            <Button size='md' radius={'md'} color='red' variant='filled' onClick={() => clearCache('portal:menu:*')}>Очистить кэш IIKO портала</Button>
                            <Button size='md' radius={'md'} color='red' variant='filled' onClick={() => clearCache('iiko:*')}>Очистить кэш IIKO для банкетов</Button>
                        </Stack>
                    </Grid.Col>
                    <Grid.Col span={3}></Grid.Col>
                    <Grid.Col span={6}></Grid.Col>
                </Grid>

            </div>
        </>
    )
}


export default withAdminPage(SettingsPage)