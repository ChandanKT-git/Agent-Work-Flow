/**
 * AuthContext — Manages JWT token state and provides login/logout helpers.
 * Persists token to localStorage so the user stays logged in on refresh.
 */

import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    // Initialize token from localStorage if available
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });

    /**
     * Save token and user info after successful login.
     */
    const login = useCallback((newToken, userData) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
    }, []);

    /**
     * Clear token and user info on logout.
     */
    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Custom hook to consume the AuthContext.
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
