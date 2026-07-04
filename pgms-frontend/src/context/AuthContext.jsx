import { createContext, useState, useContext } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // 1. Check localStorage instantly on application initialization
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user_profile');
        const token = localStorage.getItem('access_token');
        return storedUser && token ? JSON.parse(storedUser) : null;
    });

    // 2. Login Action: Sends mobile/email credentials straight to your Django backend
    const login = async (usernameOrEmail, password) => {
        try {
            const response = await API.post('auth/login/', {
                username: usernameOrEmail,
                password: password
            });

            const { access, refresh, user: userProfile } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            localStorage.setItem('user_profile', JSON.stringify(userProfile));

            setUser(userProfile);
            return { success: true };
            
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.detail || "Invalid mobile/email or password." 
            };
        }
    };

    // 3. Logout Action: Clears all browser storage and resets the state
    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

/* eslint-disable-next-line react-refresh/only-export-components */
export const useAuth = () => useContext(AuthContext);