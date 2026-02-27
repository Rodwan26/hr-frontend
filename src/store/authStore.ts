import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import Cookies from 'js-cookie';

interface User {
    id: number;
    email: string;
    role: string;
    organization_id: number;
    department?: string;
    full_name?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string, refreshToken: string) => void;
    logout: () => void;
    checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            setAuth: (user, token, refreshToken) => {
                // Set cookies for both tokens to ensure sync with backend middleware/requests
                Cookies.set('auth_token', token, { expires: 7, secure: true, sameSite: 'strict' });
                Cookies.set('refresh_token', refreshToken, { expires: 30, secure: true, sameSite: 'strict' });
                set({ user, token, refreshToken, isAuthenticated: true });
            },
            logout: () => {
                Cookies.remove('auth_token');
                Cookies.remove('refresh_token');
                localStorage.removeItem('auth-storage');
                set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            },
            checkAuth: () => {
                const token = Cookies.get('auth_token');
                const refreshToken = Cookies.get('refresh_token');

                if (!token || !refreshToken) {
                    // Force clean state if cookies are missing
                    set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);


