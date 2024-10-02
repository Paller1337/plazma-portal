import useSWR from 'swr'
import { fetchOrganizations } from '../iikoClientApi'
import { Organization, OrganizationResponse } from '../IikoApi/types'

export function useOrganizations() {
  const { data, error } = useSWR('organizations', fetchOrganizations)

  return {
    organizations: data as OrganizationResponse | undefined,
    isLoading: !error && !data,
    isError: error,
  };
}
