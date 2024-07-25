import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import jwt from 'jsonwebtoken'
import { SECRET_KEY } from './login'
import axios from 'axios';
import { axiosInstance } from './axiosInstance';

type TUserRoles = 'admin' | 'moderator' | 'user'

export function withAdminAuthServerSideProps(gssp: GetServerSideProps, roles: TUserRoles[]): GetServerSideProps {
    return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<any>> => {
        const token = context.req.cookies.session_token
        const defaultProps = await gssp(context)

        if (!token) {
            return {
                redirect: {
                    destination: '/admin/login',
                    permanent: false,
                },
            };
        }

        try {
            const res = await axiosInstance.post('/api/token/decode', {
                token
            })

            if (res.status !== 200) {
                context.res.setHeader('Set-Cookie', 'session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT')

                return {
                    redirect: {
                        destination: '/admin/login',
                        permanent: false,
                    },
                }
            }

            const user = await axiosInstance.post('/api/admin/sms-auth/guest', {
                data: { id: res.data.accountId },
            })

            if (user.data) {
                const guest = user.data.guest.attributes
                const isAllowed = roles.includes(guest.role)

                console.log('isAllowed?: ', isAllowed)
                if (isAllowed) {
                    return {
                        props: {
                            ...defaultProps,
                            isAllowed: true,
                        }
                    }
                } else {
                    return {
                        props: {
                            ...defaultProps,
                            isAllowed: false,
                        }
                    }
                }
            }

        } catch (error) {
            return {
                redirect: {
                    destination: '/admin/login',
                    permanent: false,
                },
            }
        }

        // return await gssp(context)
    }
}
