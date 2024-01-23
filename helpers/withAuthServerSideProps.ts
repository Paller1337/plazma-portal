import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import jwt from 'jsonwebtoken'
import { SECRET_KEY } from './login'

export function withAuthServerSideProps(gssp: GetServerSideProps): GetServerSideProps {
    return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<any>> => {
        const token = context.req.cookies.session_token;

        if (!token) {
            return {
                redirect: {
                    destination: '/auth',
                    permanent: false,
                },
            };
        }

        try {
            jwt.verify(token, SECRET_KEY)
        } catch (error) {
            return {
                redirect: {
                    destination: '/auth',
                    permanent: false,
                },
            }
        }

        return await gssp(context)
    };
}
