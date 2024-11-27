import { axiosInstance } from './axiosInstance'

interface IPortalSettings {
    isDisable: boolean
    isDisableOrders: boolean
    isDisableSMSAuth: boolean
}

export const getPortalSettings = async (): Promise<IPortalSettings> => {
    const settingsRes = (await axiosInstance.post('/api/portal-setting')).data
    return settingsRes?.status?.data?.attributes
}