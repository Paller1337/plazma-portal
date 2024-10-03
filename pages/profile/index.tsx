import IndexNavButton from '@/components/IndexNavButton'
import NavBar from '@/components/NavBar'
import { useAuth } from 'context/AuthContext'
import { withAuthServerSideProps } from 'helpers/withAuthServerSideProps'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export const getServerSideProps: GetServerSideProps = withAuthServerSideProps(async (context) => {
    try {
        
        return {
            props: {} 
        }
    } catch (error) {
        console.error('Ошибка ...:', error)
        return {
            props: {} 
        }
    }
})

export default function HelpPage() {

    return (<>
        <main>
            <div
                style={{
                    padding: '48px 24px',
                    height: '300px',
                }}
            >
                Страница профиля
            </div>

        </main>


        <NavBar page='basket/history' />
    </>)
}