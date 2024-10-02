// context/IikoContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuV2ByIdResponse, NomenclatureResponse, Organization, RestaurantSection, TerminalGroup } from 'helpers/iiko/IikoApi/types'
import { fetchOrganizations, fetchTerminalGroups, fetchNomenclature, fetchMenusV2, fetchMenuByIdV2, fetchReserveRestaurantSections } from 'helpers/iiko/iikoClientApi'
import { useAuth } from './admin/AuthContext'

type IikoContextType = {
    menu: MenuV2ByIdResponse | undefined
    nomenclature: NomenclatureResponse | undefined
    organizations: Organization[] | undefined
    terminalGroups: TerminalGroup[] | undefined
    reserveRestaurantSections: RestaurantSection[] | undefined
    isLoading: boolean;
    isError: any;
    getNomenclature: (organizationId: string) => Promise<NomenclatureResponse>
};

const IikoContext = createContext<IikoContextType | undefined>(undefined);

// Провайдер контекста
export const IikoProvider = ({ children }) => {
    const [menu, setMenu] = useState<MenuV2ByIdResponse | undefined>(undefined)
    const [nomenclature, setNomenclature] = useState<NomenclatureResponse | undefined>(undefined)
    const [organizations, setOrganizations] = useState<Organization[] | undefined>(undefined)
    const [terminalGroups, setTerminalGroups] = useState<TerminalGroup[] | undefined>(undefined)
    const [reserveRestaurantSections, setReserveRestaurantSections] = useState<RestaurantSection[] | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isError, setIsError] = useState<any>(null);

    const { isAuthenticated } = useAuth()

    // Инициализация: получение организаций и терминальных групп
    useEffect(() => {
        async function initialize() {
            if (!isAuthenticated) return
            try {
                console.log('IIKO Context init start!')
                setIsLoading(true);
                // Шаг 1: Получаем организации
                const orgData = await fetchOrganizations();
                console.log('IIKO Context orgData: ', orgData)
                setOrganizations(orgData.organizations);

                if (!orgData.organizations || orgData.organizations.length === 0) {
                    throw new Error('Организации не найдены');
                }
                const organizationId = orgData.organizations[0].id;

                // Шаг 2: Получаем терминальные группы для первой организации
                const terminalGroupsData = await fetchTerminalGroups({ organizationIds: [organizationId] })
                console.log('IIKO Context terminalGroupsData: ', terminalGroupsData)
                setTerminalGroups(terminalGroupsData.terminalGroups)

                // // Шаг 3: Получаем столы для Ресторана
                const reserveRestaurantSectionsData = await fetchReserveRestaurantSections({
                    terminalGroupIds: [terminalGroupsData.terminalGroups[0].items.find(p => p.name === 'Ресторан').id]
                })
                setReserveRestaurantSections(reserveRestaurantSectionsData.restaurantSections)

                // Шаг 4: Получаем банкетное меню
                const menus = await fetchMenusV2()
                console.log('IIKO Context menus: ', menus)

                const targetMenu = await fetchMenuByIdV2({ organizationIds: [organizationId], externalMenuId: menus.externalMenus[0].id })
                setMenu(targetMenu)
                console.log('IIKO Context targetMenu: ', targetMenu)
                // const newMenu = {
                //     ...targetMenu,
                //     itemCategories: targetMenu.itemCategories.map(itemCategory => ({
                //         ...itemCategory,
                //         items: itemCategory.items.map(item => ({
                //             ...item,
                //             measureUnit: n.products.find(product => product.id === item.itemId)?.measureUnit || 'не определено',
                //         }))
                //     }))
                // }
                console.log('Menu: ', { targetMenu })


                setIsLoading(false)
            } catch (error) {
                setIsError(error);
                setIsLoading(false);
            }
        }

        initialize()
    }, [isAuthenticated])

    // Функция для получения и сохранения меню вручную
    const getNomenclature = async (organizationId: string) => {
        if (nomenclature) return nomenclature;
        try {
            setIsLoading(true);
            const nomenData: NomenclatureResponse = await fetchNomenclature({ organizationId });
            setNomenclature(nomenData);
            setIsLoading(false);
            return nomenData
        } catch (error) {
            setIsError(error);
            setIsLoading(false);
        }
    }

    useEffect(() => console.log('IIKO Context nomenclature: ', nomenclature), [nomenclature]);
    useEffect(() => console.log('IIKO Context organizations: ', organizations), [organizations])
    useEffect(() => console.log('IIKO Context terminalGroups: ', terminalGroups), [terminalGroups])
    useEffect(() => console.log('IIKO Context isLoading: ', isLoading), [isLoading])
    useEffect(() => console.log('IIKO Context isError: ', isError), [isError])


    return (
        <IikoContext.Provider value={{ menu, nomenclature, organizations, terminalGroups, reserveRestaurantSections, isLoading, isError, getNomenclature }}>
            {children}
        </IikoContext.Provider>
    );
};

// Хук для использования контекста
export const useIiko = () => {
    const context = useContext(IikoContext);
    if (context === undefined) {
        throw new Error('useIiko must be used within an IikoProvider')
    }
    return context;
};
