import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import jwt from 'jsonwebtoken'
import { SECRET_KEY } from './login'

export function withAdminAuthServerSideProps(gssp: GetServerSideProps): GetServerSideProps {
    return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<any>> => {
        const token = context.req.cookies.a_session_token;

        if (!token) {
            return {
                redirect: {
                    destination: '/admin/auth',
                    permanent: false,
                },
            };
        }

        try {
            jwt.verify(token, SECRET_KEY)
        } catch (error) {
            return {
                redirect: {
                    destination: '/admin/auth',
                    permanent: false,
                },
            }
        }

        return await gssp(context)
    };
}
