import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from './login'
// const SECRET_KEY = 'your-secret-key';

export function withAuthServerSideProps(gssp: GetServerSideProps): GetServerSideProps {
    return async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<any>> => {
        const token = context.req.cookies.session_token;

        const result = await gssp(context);

        if ('props' in result) {
            if (!token) {
                return {
                    ...result,
                    props: {
                        ...result.props,
                        // auth: null,
                        auth: {
                            id: '1',
                            phone: '79539687367',
                            name: 'Максим',
                        }
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
                        auth: null
                    },
                };
            }

            return {
                ...result,
                props: {
                    ...result.props,
                    auth: jwt.decode(token),
                },
            };
        }

        return result;
    };
}
