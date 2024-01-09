import React, { createContext, useContext, useState, ReactNode } from 'react'

interface AuthContextType {
    isAuthenticated: boolean
    login: (surname: string, roomNumber: number) => Promise<void>
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const login = async (surname: string, roomNumber: number) => {
        try {
            // Отправка запроса на сервер для проверки данных
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ surname, roomNumber }),
            });

            if (!response.ok) throw new Error('Ошибка авторизации');

            setIsAuthenticated(true);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login }}>
            {children}
        </AuthContext.Provider>
    );
};
