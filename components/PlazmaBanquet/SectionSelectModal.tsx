'use client';
import React, { Dispatch, MutableRefObject, RefObject, SetStateAction, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Select, Text, Button } from '@mantine/core';
import { useIiko } from 'context/IikoContext';
import { RestaurantSection, TerminalGroup } from 'helpers/iiko/IikoApi/types';
import { useRestaurantSections } from 'helpers/iiko/hooks/useRestautantSections';
import { ISectionSelect } from 'pages/admin/banquet-management/[id]';
import { fetchReserveRestaurantSections } from 'helpers/iiko/iikoClientApi'
import { useDebouncedState } from '@mantine/hooks';

const Modal = dynamic(() => import('@mantine/core').then((mod) => mod.Modal), { ssr: false })

interface SectionSelectModalProps {
    opened: boolean;
    close: () => void;
    onChange: Dispatch<SetStateAction<ISectionSelect>>;
}

type RestaurantSectionMap = {
    [key: number]: RestaurantSection;
};

export default function SectionSelectModal({ opened, close, onChange }: SectionSelectModalProps) {
    const { terminalGroups, organizations } = useIiko()
    const terminalIds = terminalGroups?.flatMap((group) => group.items).map((terminal) => terminal.id)
    // const { restaurantSections } = useRestaurantSections([...terminalIds])
    // restaurantSections[0].

    const [terminalOptions, setTerminalOptions] = useState<{ value: string; label: string }[]>([])
    const [selectedTerminalId, setSelectedTerminalId] = useState<string | null>(null);


    const [selectedSectionOptions, setSelectedSectionOptions] = useState<{ value: string; label: string }[]>([])
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)

    const [tablesForSections, setTablesForSections] = useState<RestaurantSectionMap>(null)
    const [tableOptions, setTableOptions] = useState<{ value: string; label: string }[]>([]);
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

    useEffect(() => {
        if (terminalGroups && terminalGroups.length > 0) {
            setTerminalOptions(terminalGroups[0].items.filter(x => x.name === 'Ресторан').map(t => ({ value: t.id, label: t.name })))
        }
    }, [terminalGroups])

    useEffect(() => console.log(
        { selectedTerminalId, terminalOptions, selectedSectionId, selectedSectionOptions, selectedTableId, tableOptions }
    ), [selectedTerminalId, terminalOptions, selectedSectionId, selectedSectionOptions, selectedTableId, tableOptions])

    // Обработка выбора терминала
    const handleTerminalChange = async (value: string) => {
        console.log('handleTerminalChange: ', value)
        setSelectedTerminalId(value)
        if (!value) {
            setSelectedSectionOptions([])
        }
        // Сброс следующих выборов
        // setSelectedSectionId('')
        // setTableOptions([])
        // setSelectedTableId('')
    }

    useEffect(() => {
        const refetch = async () => {
            if (selectedTerminalId) {
                const reserveRestaurantSections = await fetchReserveRestaurantSections({ terminalGroupIds: [selectedTerminalId] })
                setSelectedSectionOptions(reserveRestaurantSections.restaurantSections
                    // .filter(x => x.name === 'Банкетный зал')
                    .map(r => ({
                        value: r.id,
                        label: r.name
                    })))

                setTablesForSections(
                    reserveRestaurantSections.restaurantSections.reduce((acc, p) => {
                        acc[p.id] = p;
                        return acc;
                    }, {} as RestaurantSectionMap)
                )
            }
        }
        refetch()
    }, [selectedTerminalId])


    // Обработка выбора зала
    const handleSectionChange = (value: string) => {
        setSelectedSectionId(value)
        setTableOptions([])
        setSelectedTableId('')
    }


    useEffect(() => {
        if (selectedSectionId && tablesForSections[selectedSectionId]) {
            setTableOptions(tablesForSections[selectedSectionId].tables.map(t => ({ label: t.name, value: t.id })));
        } else {
            setTableOptions([]);  // Если зал не выбран или нет данных, сбрасываем опции
        }
    }, [selectedSectionId, tablesForSections]);

    // Обработка выбора стола
    const handleTableChange = (value: string) => {
        setSelectedTableId(value);
        // Вы можете вызвать onChange здесь, если нужно передать выбранный стол наружу
        onChange({
            terminalGroupId: terminalOptions.find(o => o.value === selectedTerminalId),
            restaurantSection: selectedSectionOptions.find(o => o.value === selectedSectionId),
            organizationId: organizations[0].id,
            tableIds: (tablesForSections[selectedSectionId] as RestaurantSection).tables.map(t => ({ label: t.name, value: t.id })).filter(t => t.value === value)
        })
    };

    return (
        <Modal
            opened={opened}
            onClose={close}
            title={<Text size="lg" fw={700}>Выбор стола</Text>}
            centered
            size="md"
            radius="lg"
        >
            {/* Шаг 1 */}
            <Select
                label="Выберите терминал"
                placeholder="Выберите терминал"
                data={terminalOptions}
                value={selectedTerminalId}
                onChange={handleTerminalChange}
                disabled={terminalOptions.length === 0}
            />

            {/* Шаг 2 */}
            <Select
                label="Выберите зал"
                placeholder="Выберите зал"
                data={selectedSectionOptions}
                value={selectedSectionId}
                onChange={handleSectionChange}
                disabled={!selectedTerminalId || selectedSectionOptions.length === 0}
            />

            {/* Шаг 3 */}
            <Select
                key={selectedSectionId}
                label="Выберите стол"
                placeholder="Выберите стол"
                data={tableOptions}
                value={selectedTableId}
                onChange={handleTableChange}
                disabled={!selectedSectionId || tableOptions.length === 0}
            />

            {/* Шаг 4 */}
            {/* Дополнительные шаги при необходимости */}
            <Button
                mt={24}
                w={'100%'}
                h={42}
                variant='filled'
                color='blue'
                onClick={() => {
                    onChange({
                        terminalGroupId: terminalOptions.find(o => o.value === selectedTerminalId),
                        restaurantSection: selectedSectionOptions.find(o => o.value === selectedSectionId),
                        organizationId: organizations[0].id,
                        tableIds: (tablesForSections[selectedSectionId] as RestaurantSection).tables.map(t => ({ label: t.name, value: t.id })).filter(t => t.value === selectedTableId)
                    })
                    close()
                }}>
                Выбрать
            </Button>
        </Modal>
    );
}
