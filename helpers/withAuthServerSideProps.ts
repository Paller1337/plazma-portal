import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from './login'
import { axiosInstance } from './axiosInstance';
import { getPortalSettings } from './getPortalSettings';
// const SECRET_KEY = 'your-secret-key';

export function withAuthServerSideProps(gssp: GetServerSideProps): GetServerSideProps {
    return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<any>> => {
        try {
            // const settingsRes = (await axiosInstance.post('/api/portal-setting')).data
            // const settings = {
            //     isDisable: settingsRes?.status?.data?.attributes?.isDisable,
            //     isDisableOrders: settingsRes?.status?.data?.attributes?.isDisableOrders,
            //     isDisableSMSAuth: settingsRes?.status?.data?.attributes?.isDisableOrders,
            //     debug: settingsRes?.status?.data?.attributes?.isDisableOrders,
            // }
            const settings = await getPortalSettings()

            const token = context.req.cookies.session_token;
            const result = await gssp(context)

            if ('props' in result) {
                if (!token) {
                    return {
                        ...result,
                        props: {
                            ...result.props,
                            auth: null,
                            // auth: {
                            //     id: '1',
                            //     phone: '79539687367',
                            //     name: 'Максим',
                            // }
                            settings
                        },
                    };
                }
                try {
                    jwt.verify(token, SECRET_KEY);
                } catch (error) {
                    return {
                        ...result,
                        props: {
                            ...result.props,
                            auth: null,
                            settings
                        },
                    };
                }

                return {
                    ...result,
                    props: {
                        ...result.props,
                        auth: jwt.decode(token),
                        settings
                    },
                };
            }

            return result;
        } catch (error) {
            console.log('e')
        }
    };
}
