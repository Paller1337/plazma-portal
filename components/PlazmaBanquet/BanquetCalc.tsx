import { Group, Input, Text } from '@mantine/core';
import { SetStateAction, useEffect, useState } from 'react';
import { IBanquetOrderItemWithState, IReserveByPortal } from 'types/admin/banquets';

interface BanquetCalcProps {
    data: IReserveByPortal
    updateData: (data: SetStateAction<IReserveByPortal>) => void
}
export default function BanquetCalc({ data, updateData }: BanquetCalcProps) {
    const [neededPerPerson, setNeededPerPerson] = useState(data.needPersonSum || 0)
    const [requiredAmount, setRequiredAmount] = useState(data.needSum || 0)
    const [currentPerPerson, setCurrentPerPerson] = useState(0)
    const [totalAmount, setTotalAmount] = useState(0)
    const [lastChangedField, setLastChangedField] = useState(null) // 'neededPerPerson' или 'requiredAmount'

    const [target, setTarget] = useState((data?.banquetData.order?.items as IBanquetOrderItemWithState[])?.filter(item => item.isCounting !== false))

    // useEffect(() => console.log('counter: ', data), [data]);
    useEffect(() => setTarget((data?.banquetData.order?.items as IBanquetOrderItemWithState[])?.filter(item => item.isCounting !== false)), [data])
    useEffect(() => {
        // Рассчитываем "Сумму банкета"
        // console.log('// Рассчитываем "Сумму банкета"')
        const total = target?.reduce(
            (a, b) => a + parseFloat(b.price) * b.amount,
            0
        );
        setTotalAmount(total);

        // Рассчитываем "Сейчас на чел."
        const guestsCount = data?.banquetData.guests.count;
        setCurrentPerPerson(total / guestsCount);
    }, [target, data?.banquetData.order?.items, data?.banquetData.guests.count]);

    useEffect(() => {
        const guestsCount = data?.banquetData.guests.count;
        if (lastChangedField === 'neededPerPerson') {
            setRequiredAmount(neededPerPerson * guestsCount);
        }
    }, [neededPerPerson, data?.banquetData.guests.count]);

    useEffect(() => {
        const guestsCount = data?.banquetData.guests.count;
        if (lastChangedField === 'requiredAmount') {
            setNeededPerPerson(requiredAmount / guestsCount);
        }
    }, [requiredAmount, data?.banquetData.guests.count]);

    useEffect(() => {
        // Обновляем "Сейчас на чел." при изменении количества гостей или общей суммы
        const guestsCount = data?.banquetData.guests.count
        setCurrentPerPerson(totalAmount / guestsCount)
    }, [totalAmount, data?.banquetData.guests.count])


    useEffect(() => {
        updateData(d => ({
            ...d,
            needPersonSum: neededPerPerson,
            needSum: requiredAmount
        }))
    }, [neededPerPerson, requiredAmount])
    return (
        <Group px={24} py={12} mb={24} style={{ borderRadius: 12, backgroundColor: '#262E4A' }} justify='space-between' align='flex-start'>
            <Input.Wrapper label="Сумма банкета:" styles={{ label: { 'color': 'white' } }}>
                <Input placeholder="0" radius={'md'} disabled styles={{ input: { opacity: '1' } }}
                    value={totalAmount?.toFixed(2)} />
            </Input.Wrapper>
            <Group align='flex-start'>
                <Input.Wrapper label="Сейчас на чел.:" styles={{ label: { 'color': 'white' } }}>
                    <Input placeholder="0" radius={'md'} disabled styles={{ input: { opacity: '1' } }} value={currentPerPerson?.toFixed(2)} />
                </Input.Wrapper>
                <Input.Wrapper label="Нужно на чел.:" styles={{ label: { 'color': 'white' } }}>
                    <Input placeholder="0" radius={'md'} styles={{ input: { opacity: '1' } }} type='number'
                        value={neededPerPerson} onChange={(e) => {
                            setNeededPerPerson(parseFloat(e.target.value) || 0);
                            setLastChangedField('neededPerPerson');
                        }} />
                    {neededPerPerson && neededPerPerson > currentPerPerson ?
                        <Input.Description>
                            <span style={{ color: '#40c057' }}>
                                Необходимо еще {(neededPerPerson - currentPerPerson)?.toFixed(2)}
                            </span>
                        </Input.Description> : <></>
                    }

                    {neededPerPerson && neededPerPerson < currentPerPerson ?
                        <Input.Error>
                            <span style={{ color: '#f23' }}>
                                Вы вышли за рамки на {(currentPerPerson - neededPerPerson)?.toFixed(2)}
                            </span>
                        </Input.Error> : <></>
                    }
                </Input.Wrapper>
                <Input.Wrapper label="Необходимая сумма" styles={{ label: { 'color': 'white' } }}>
                    <Input placeholder="0" radius={'md'} styles={{ input: { opacity: '1' } }} type='number'
                        value={requiredAmount}
                        onChange={(e) => {
                            setRequiredAmount(parseFloat(e.target.value) || 0);
                            setLastChangedField('requiredAmount');
                        }} />
                    {requiredAmount && requiredAmount > totalAmount ?
                        <Input.Description>
                            <span style={{ color: '#40c057' }}>
                                Необходимо еще {(requiredAmount - totalAmount)?.toFixed(2)}
                            </span>
                        </Input.Description> : <></>
                    }

                    {requiredAmount && requiredAmount < totalAmount ?
                        <Input.Error>
                            <span style={{ color: '#f23' }}>
                                Вы вышли за рамки на {(totalAmount - requiredAmount)?.toFixed(2)}
                            </span>
                        </Input.Error> : <></>
                    }
                </Input.Wrapper>
            </Group>
        </Group>
    )
}