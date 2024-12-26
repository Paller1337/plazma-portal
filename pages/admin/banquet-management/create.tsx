import { Button, Divider, Grid, Group, Input, InputBase, LoadingOverlay, NumberInput, Select, Stack, Textarea } from '@mantine/core'

import { getRooms } from 'helpers/bnovo/getRooms'
import { withAdminAuthServerSideProps } from 'helpers/withAdminAuthServerSideProps'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next/types'
import { useEffect, useState } from 'react'

import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import 'mantine-react-table/styles.css'
import { Text } from '@mantine/core'
import dynamic from 'next/dynamic'
import { IMaskInput } from 'react-imask'
import { OrderTable } from '@/components/PlazmaBanquet/OrderTable'
import ClientProviderLayout from '@/components/ClientProviderLayout'
import { IReserveByPortal } from 'types/admin/banquets'
import { ReserveCreateRequest } from 'helpers/iiko/IikoApi/types'
import { get } from 'lodash'
import { useDebouncedState, useDisclosure } from '@mantine/hooks'
import { useIiko } from 'context/IikoContext'
import BanquetCalc from '@/components/PlazmaBanquet/BanquetCalc'
import { validateBanquet } from 'helpers/banquets/validateForm'
import { withAdminPage } from 'helpers/withAdminPage'
import { ISectionSelect } from './[id]'
import SectionSelectModal from '@/components/PlazmaBanquet/SectionSelectModal'

const DateTimePicker = dynamic(() => import('@mantine/dates').then((mod) => mod.DateTimePicker), { ssr: false });

interface BanquetManagementPageProps {
}

export const getServerSideProps: GetServerSideProps = withAdminAuthServerSideProps(async (context) => {
    try {
        
        return {
            props: {
            }
        };
    } catch (error) {
        console.error('Ошибка:', error);
        return { props: { orders: [] } };
    }
}, ['admin', 'banquet'])


const formatNumber = (n: string) => {
    if (!n) return ""
    n = n.replace(/[\(\)\-\ ]/g, "")

    if (n.startsWith("+7")) {
        if (n[2] === '8') {
            return "+7" + n.slice(3)
        }
        return n
    }

    if (n[0] === '8') {
        n = "+7" + n.slice(1);
        if (n[2] === '8') {
            return "+7" + n.slice(3)
        }
        return n
    }

    return n
}


function BanquetCreatePage(props: BanquetManagementPageProps) {
    const router = useRouter()
    const nowDate = DateTime.now().plus({ hour: 1 }).toSQL({ includeOffset: false })
    const iiko = useIiko()
    const [isOverlay, overlay] = useDisclosure(false)

    const [banquetData, setBanquetData] = useState<ReserveCreateRequest>({
        comment: '',
        customer: {
            name: '',
            type: 'one-time',
        },
        durationInMinutes: 30,
        estimatedStartTime: nowDate,
        organizationId: iiko.organizations ? iiko.organizations[0].id : '', //Обязательно
        phone: '',
        shouldRemind: false,
        tableIds: [],
        guests: {
            count: 1,
        },
        terminalGroupId: '',
        order: {
            items: [],
        },
    })
    // const defaultBanquetData: ReserveCreateRequest =  as ReserveCreateRequest

    const [createState, setCreateState] = useDebouncedState<IReserveByPortal>({
        status: 'not_sent',
        banquetData: banquetData as ReserveCreateRequest,
        serviceNote: '',
        isDeleted: false,
        payments: [],
        needSum: 0,
    }, 500)


    const [isSectionSelectModal, sectionSelectModalState] = useDisclosure(false)

    const [sectionState, setSectionState] = useState<ISectionSelect>({
        organizationId: '',
        terminalGroupId: {
            label: '',
            value: '',
        },
        restaurantSection: {
            label: '',
            value: ''
        },
        tableIds: []
    })

    useEffect(() => {
        if (sectionState.organizationId && sectionState.terminalGroupId.value && sectionState.tableIds.length > 0) {
            setCreateState(p => ({
                ...p,
                banquetData: {
                    ...p.banquetData,
                    terminalGroupId: sectionState.terminalGroupId.value,
                    tableIds: sectionState.tableIds.map(t => t.value)
                }
            }))
        }
    }, [sectionState])

    const [phone, setPhone] = useState('')
    const [phoneValue, setPhoneValue] = useState('+7')

    // const [user, setUser] = useInputState('')
    const [user, setUser] = useDebouncedState('', 200)

    useEffect(() => {
        if (!iiko.isLoading) {
            const terminal = iiko.terminalGroups[0].items.find(p => p.name === 'Ресторан')
            console.log('iiko terminal: ', terminal)
            console.log('iiko sections: ', iiko.reserveRestaurantSections)
            const table = iiko.reserveRestaurantSections.find(p => p.name === 'Зал 1').tables[0]
            setBanquetData(p => ({
                ...p,
                organizationId: iiko.organizations[0]?.id,
                terminalGroupId: terminal?.id,
                tableIds: [table.id],
            }))
        }
    }, [iiko])

    useEffect(() => setCreateState(p => ({ ...p, banquetData: { ...p.banquetData, order: banquetData.order } })), [banquetData.order])

    useEffect(() => {
        console.log('iiko: ', { iiko })
    }, [iiko])


    async function createBanquet() {
        overlay.open()

        const body = JSON.stringify(createState)

        await fetch('/api/iiko/db/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: body
        })
            .then(res => {
                if (res.status === 200) {
                    const timeout = setTimeout(() => router.push('/admin/banquet-management', null, { shallow: true })
                        .finally(() => overlay.close()), 500)
                    console.log('json banquet res: ', res)
                    return () => clearTimeout(timeout)
                }
            })
    }

    useEffect(() => {

        console.log('createState: ', createState)
    }, [createState])
    return (
        <>
            <LoadingOverlay visible={isOverlay} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
            <ClientProviderLayout>
                <SectionSelectModal opened={isSectionSelectModal} close={sectionSelectModalState.close} onChange={setSectionState} />
                <div className='admin--order'>
                    <div className='admin--order__header'>
                        <div className='admin--order__header-content'>
                            <span className='admin--order__header-title'>Создание банкета</span>
                            <Button ml={'auto'} size='md' radius={'md'} variant='outline' color='violet'
                                onClick={() => sectionSelectModalState.open()}>
                                {sectionState.restaurantSection.label &&
                                    sectionState.terminalGroupId.label &&
                                    sectionState.tableIds.length > 0 ?
                                    `${sectionState.terminalGroupId.label}; ${sectionState.restaurantSection.label}, Стол: ${sectionState.tableIds[0].label}`
                                    : 'Выбрать место проведения'}
                            </Button>
                            <Button ml={'auto'} size='md' radius={'md'} variant='filled' color='blue'
                                onClick={() => {
                                    overlay.open()
                                    router.push('/admin/banquet-management', null, { shallow: true })
                                        .finally(() => overlay.close())
                                }}>
                                Вернуться к списку банкетов
                            </Button>
                            <Button color='green' onClick={createBanquet} ml='24' variant='filled' size='md' radius={'md'}>Создать</Button>
                        </div>
                        <div className='admin-main__vs' />
                    </div>


                    <Grid columns={12} px={24} py={12} gutter="xl">
                        <Grid.Col span={4}>
                            <Stack>
                                <DateTimePicker
                                    // valueFormat="DD MMM YYYY hh:mm A"
                                    valueFormat={'DD MMM YYYY [в] HH:mm, dddd'}
                                    label="Дата и время"
                                    description="Дата и время начала банкета"
                                    placeholder="Выберите дату и время"
                                    hideOutsideDates={false}
                                    radius={'md'}
                                    minDate={new Date(DateTime.now().plus({ hour: 1 }).toJSDate())}
                                    // value={new Date(DateTime.fromSQL(createState.banquetData.estimatedStartTime).toJSDate())}
                                    onChange={value => setCreateState(prev =>
                                        ({ ...prev, banquetData: { ...prev.banquetData, estimatedStartTime: DateTime.fromJSDate(value).toSQL({ includeOffset: false }) } }))}
                                    error={validateBanquet('banquetData.estimatedStartTime', createState)}
                                />

                                <Select
                                    label="Длительность банкета"
                                    description="Сколько времени займет проведение банкета"
                                    placeholder="Выберите длительность"
                                    radius={'md'}
                                    allowDeselect={false}
                                    data={[
                                        { value: '60', label: '1 час' },
                                        { value: '90', label: '1 час 30 минут' },
                                        { value: '120', label: '2 часа' },
                                        { value: '150', label: '2 часа 30 минут' },
                                        { value: '180', label: '3 часа' },
                                        { value: '210', label: '3 часа 30 минут' },
                                        { value: '240', label: '4 часа' },
                                        { value: '270', label: '4 часа 30 минут' },
                                        { value: '300', label: '5 часов' },
                                        { value: '330', label: '5 часов 30 минут' },
                                        { value: '360', label: '6 часов' },
                                        { value: '390', label: '6 часов 30 минут' },
                                        { value: '420', label: '7 часов' },
                                        { value: '450', label: '7 часов 30 минут' },
                                        { value: '480', label: '8 часов' },
                                        { value: '510', label: '8 часов 30 минут' },
                                        { value: '540', label: '9 часов' },
                                        { value: '570', label: '9 часов 30 минут' },
                                        { value: '600', label: '10 часов' },
                                        { value: '630', label: '10 часов 30 минут' },
                                        { value: '660', label: '11 часов' },
                                        { value: '690', label: '11 часов 30 минут' },
                                        { value: '720', label: '12 часов' },
                                        { value: '750', label: '12 часов 30 минут' },
                                        { value: '780', label: '13 часов' },
                                        { value: '810', label: '13 часов 30 минут' },
                                        { value: '840', label: '14 часов' },
                                        { value: '870', label: '14 часов 30 минут' },
                                        { value: '900', label: '15 часов' },
                                        { value: '930', label: '15 часов 30 минут' },
                                        { value: '960', label: '16 часов' },
                                        { value: '990', label: '16 часов 30 минут' },
                                        { value: '1020', label: '17 часов' },
                                        { value: '1050', label: '17 часов 30 минут' },
                                        { value: '1080', label: '18 часов' },
                                        { value: '1110', label: '18 часов 30 минут' },
                                        { value: '1140', label: '19 часов' },
                                        { value: '1170', label: '19 часов 30 минут' },
                                        { value: '1200', label: '20 часов' },
                                        { value: '1230', label: '20 часов 30 минут' },
                                        { value: '1260', label: '21 час' },
                                        { value: '1290', label: '21 час 30 минут' },
                                        { value: '1320', label: '22 часа' },
                                        { value: '1350', label: '22 часа 30 минут' },
                                        { value: '1380', label: '23 часа' },
                                        { value: '1410', label: '23 часа 30 минут' },
                                        { value: '1440', label: '24 часа' },
                                    ]}

                                    onChange={value => setCreateState(p => ({ ...p, banquetData: { ...p.banquetData, durationInMinutes: parseInt(value), }, }))}
                                    // value={createState.banquetData?.durationInMinutes.toString()}
                                    error={validateBanquet('banquetData.durationInMinutes', createState)}
                                />

                                <NumberInput
                                    label="Количество гостей"
                                    placeholder="Введите количество гостей"
                                    radius={'md'}
                                    min={1}
                                    max={99}
                                    onChange={value => setCreateState(p => ({ ...p, banquetData: { ...p.banquetData, guests: { count: parseInt(value as string) }, }, }))}
                                    // value={createState.banquetData?.guests.count}
                                    error={validateBanquet('banquetData.guests.count', createState)}
                                />

                                <Input.Wrapper label="Имя гостя" description="Имя заказчика банкета"
                                    error={validateBanquet('banquetData.customer.name', createState)}
                                >
                                    <Input placeholder="Иван Иванов" radius={'md'}
                                        onChange={e => {
                                            setCreateState(p => ({ ...p, banquetData: { ...p.banquetData, customer: { ...p.banquetData.customer, name: e.target.value } } }))
                                        }}
                                        // value={createState.banquetData?.customer?.name}
                                        error={validateBanquet('banquetData.customer.name', createState)}
                                    />
                                </Input.Wrapper>

                                <InputBase
                                    label='Номер гостя'
                                    description="Номер заказчика банкета"
                                    withAsterisk
                                    component={IMaskInput}
                                    mask="+7 (000) 000-00-00"
                                    placeholder="+7 (000) 000-00-00"
                                    size='sm'
                                    radius='md'
                                    w={'100%'}
                                    value={phoneValue}
                                    onInput={e => {
                                        // @ts-ignore
                                        let value = e.target.value
                                        // console.log('value[4] ', value[4])
                                        if (value[4] == '8') {
                                            setPhoneValue('+7')
                                        } else {
                                            setPhoneValue(value)
                                        }

                                        // @ts-ignore
                                        let newValue = formatNumber(e.target.value.toString())
                                        setPhone(newValue)
                                        setCreateState(p => ({ ...p, banquetData: { ...p.banquetData, phone: newValue } }))
                                    }}
                                    defaultValue={'+7'}
                                    error={validateBanquet('banquetData.phone', createState)}
                                />
                            </Stack>
                        </Grid.Col>

                        <Grid.Col span={6}>
                            <Stack>
                                <Textarea
                                    radius="md"
                                    label="Комментарий"
                                    description="Комментарий к заказу"
                                    placeholder="Введите комментарий"
                                    autosize
                                    minRows={4}
                                    onChange={e => setCreateState(p => ({ ...p, banquetData: { ...p.banquetData, comment: e.target.value } }))}
                                />

                                <Textarea
                                    radius="md"
                                    label="Заметка для администраторов"
                                    description="Служебная заметка"
                                    placeholder="Введите заметку"
                                    autosize
                                    minRows={4}
                                    onChange={e => setCreateState(p => ({ ...p, serviceNote: e.target.value }))}
                                />
                            </Stack>
                        </Grid.Col>
                    </Grid>

                    <Stack px={24} pt={12} mt={24}>
                        <Text size='xl' fw={500}>Заказ</Text>
                        <Divider my={'xs'} />


                        <BanquetCalc data={createState} updateData={setCreateState} />
                    </Stack>

                    <Stack px={24} py={12}>
                        <OrderTable data={banquetData} onOrderChanged={setBanquetData} />
                    </Stack>


                </div>
            </ClientProviderLayout >
        </>
    )
}


export default withAdminPage(BanquetCreatePage)