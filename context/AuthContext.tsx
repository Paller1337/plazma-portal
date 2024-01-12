import authenticationPortal, { verifyToken } from 'helpers/login';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import Cookies from 'cookies'

interface AuthContextType {
    isAuthenticated: boolean
    login: (surname: string, roomNumber: string) => Promise<{
        status: boolean;
        message: string;
    }>
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const isAuth = verifyToken()
        if (isAuth) setIsAuthenticated(true)
    }, [])

    const login = async (surname: string, roomNumber: string) => {
        const auth = await authenticationPortal(surname, roomNumber)
        if (auth.status) {
            setIsAuthenticated(true)
            return auth
        } else {
            setIsAuthenticated(false)
            return auth
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login }}>
            {children}
        </AuthContext.Provider>
    )
}
