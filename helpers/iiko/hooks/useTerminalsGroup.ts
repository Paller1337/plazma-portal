import useSWR from 'swr'
import { fetchTerminalGroups } from '../iikoClientApi'
import { TerminalGroup } from '../IikoApi/types'

export function useTerminalsGroup(organizationIds: string[]) {
    const shouldFetch = organizationIds.length > 0

    const { data, error } = useSWR(
        shouldFetch ? ['terminal-groups', organizationIds] : null,
        () => fetchTerminalGroups({ organizationIds })
    )

    return {
        terminalGroups: data.terminalGroups as TerminalGroup[] | undefined,
        isLoading: !error && !data,
        isError: error,
    }
}
