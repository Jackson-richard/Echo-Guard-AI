import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);

// MOCK_USER removed - using real Auth

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(!!token);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if (!token) {
                setIsLoading(false);
                return;
            }
            try {
                const res = await fetch('/api/v1/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setUser(data.user);
                    setIsAuthenticated(true);
                } else {
                    setUser(null);
                    setToken(null);
                    localStorage.removeItem('token');
                    setIsAuthenticated(false);
                }
            } catch (e) {
                console.error('Auth check error', e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, [token]);

    const login = useCallback(async (email, password, rememberMe = false) => {
        try {
            const res = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            // Handle HTTP 502/503/504 indicating backend down
            if (!res.ok && res.status >= 500) {
                return { success: false, error: 'Backend unavailable or MongoDB offline.' };
            }

            const data = await res.json();

            if (res.ok && data.token) {
                setToken(data.token);
                if (rememberMe) {
                    localStorage.setItem('token', data.token);
                } else {
                    sessionStorage.setItem('token', data.token);
                }
                setUser(data.user);
                setIsAuthenticated(true);
                return { success: true };
            }
            return { success: false, error: data.error || 'Invalid credentials.' };
        } catch (e) {
            return { success: false, error: 'Cannot connect to backend. Timeout contacting server.' };
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setIsAuthenticated(false);
    }, []);

    if (isLoading) {
        return <div className="min-h-screen bg-cyber-bg flex items-center justify-center text-accent">Loading Identity...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be within AuthProvider');
    return ctx;
};
