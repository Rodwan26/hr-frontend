import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export const authService = {
    login: async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        const { user, access_token, refresh_token } = response.data;

        // Update global store
        useAuthStore.getState().setAuth(user, access_token, refresh_token);

        return response.data;
    },
    refresh: async (refreshToken: string) => {
        const response = await api.post(`/auth/refresh?refresh_token=${refreshToken}`);
        const { access_token, refresh_token: newRefreshToken, user } = response.data;

        // Update global store
        const currentUser = useAuthStore.getState().user;
        useAuthStore.getState().setAuth(user || currentUser, access_token, newRefreshToken);

        return access_token;
    },
    logout: () => {
        useAuthStore.getState().logout();
    },
    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    }
};

