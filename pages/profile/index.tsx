import IndexNavButton from '@/components/IndexNavButton'
import NavBar from '@/components/NavBar'
import { useAuth } from 'context/AuthContext'
import { useRouter } from 'next/router'
import { useEffect } from 'react'


export default function HelpPage() {
    const { isAuthenticated } = useAuth()
    const router = useRouter()
    useEffect(() => {
        if (!isAuthenticated) router.push('/auth')
    }, [isAuthenticated, router])

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


        <NavBar page='profile' />
    </>)
}