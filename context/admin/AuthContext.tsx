import { verifyToken } from 'helpers/login'
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useRouter } from 'next/router'

interface AuthContextType {
    isAdminAuthenticated: boolean
    login: (surname: string, roomNumber: string) => Promise<{
        status: boolean;
        message: string;
    }>
    currentUser?: {
        id: number
        role: string
    }
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
    const [authIsChecked, setAuthIsChecked] = useState(false)
    const [currentUser, setCurrentUser] = useState({ id: 0, role: '' })
    const router = useRouter()

    const login = async (username: string, pass: string) => {
        const auth = await axios.post('/api/admin/login', {
            data: {
                username,
                pass
            }
        })

        if (auth.data.data.status == true) {
            setIsAdminAuthenticated(true)
            Cookies.set('a_session_token', auth.data.sessionToken)
            // console.log('auth.data.sessionToken: ', auth.data.sessionToken)
            toast.success(auth.data.data.message)
            return auth.data.data
        } else {
            setIsAdminAuthenticated(false)
            toast.error(auth.data.data.message)
            return auth.data.data
        }
    }


    useEffect(() => {
        async function checkAuthToken() {
            const token = Cookies.get('a_session_token')

            if (!token) return
            const res = await axios.post('/api/token/decode', {
                token
            })
            setAuthIsChecked(true)
            if (res.status === 200) {
                const decodedToken = res.data
                if (decodedToken.isExpired) {
                    Cookies.remove('a_session_token')
                    setIsAdminAuthenticated(false)
                    router.push('/admin/auth')
                    return
                }

                if (decodedToken.role) {
                    setCurrentUser({
                        id: decodedToken.accountId,
                        role: decodedToken.role
                    })
                    setIsAdminAuthenticated(true)
                }
            }
        }

        checkAuthToken()
    }, [isAdminAuthenticated, authIsChecked, router])

    return (
        <AuthContext.Provider value={{ isAdminAuthenticated, login, currentUser }}>
            {children}
        </AuthContext.Provider>
    )
}
