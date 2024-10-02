import useSWR from 'swr'
import { AvailableRestaurantSectionsResponse } from '../IikoApi/types';
import { fetchReserveRestaurantSections } from '../iikoClientApi';

export function useRestaurantSections(terminalGroupIds: string[]) {
    const shouldFetch = terminalGroupIds.length > 0;

    const { data, error } = useSWR<AvailableRestaurantSectionsResponse>(
        shouldFetch ? ['reserve_available_restaurant_sections', terminalGroupIds] : null,
        () => fetchReserveRestaurantSections({ terminalGroupIds })
    )
    return {
        restaurantSections: data?.restaurantSections,
        isLoading: !error && !data,
        isError: error,
    }
}
