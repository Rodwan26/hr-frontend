import axios from 'axios';
import { config } from './config';
import { useAuthStore } from '@/store/authStore';

/**
 * Professional Axios Instance
 * - Centralized configuration
 * - Automatic Bearer Token injection
 * - Unified error handling & Automatic 401 Refresh
 */
const api = axios.create({
    baseURL: `${config.apiBaseUrl}${config.apiPrefix}`,
    timeout: 15000, // 15 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request Interceptor: Add Authorization header
api.interceptors.request.use(
    (axiosConfig) => {
        const token = useAuthStore.getState().token;
        if (token) {
            axiosConfig.headers.Authorization = `Bearer ${token}`;
        }
        return axiosConfig;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling & Refresh Flow
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const errDetail = error.response?.data?.errors?.[0]?.msg || error.response?.data?.detail;

        // If it's a 401 and not a retry, attempt to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            console.warn(`[API] 401 Unauthorized detected on ${originalRequest.url}. Reason: ${errDetail}`);
            
            if (isRefreshing) {
                console.log(`[API] Token refresh already in progress, queuing request: ${originalRequest.url}`);
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = useAuthStore.getState().refreshToken;

            if (!refreshToken) {
                console.error('[API] No refresh token available. Logging out.');
                useAuthStore.getState().logout();
                return Promise.reject(error);
            }

            try {
                console.log('[API] Attempting token refresh...');
                // We use base axios to avoid infinite loops if refresh fails
                const res = await axios.post(
                    `${config.apiBaseUrl}${config.apiPrefix}/auth/refresh?refresh_token=${refreshToken}`
                );

                if (res.status === 200 || res.status === 201) {
                    const { access_token, refresh_token, user } = res.data;
                    console.log('[API] Token refresh successful.');

                    useAuthStore.getState().setAuth(
                        user || useAuthStore.getState().user,
                        access_token,
                        refresh_token
                    );

                    processQueue(null, access_token);
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error('[API] Token refresh failed. Cleaning up session.', refreshError);
                processQueue(refreshError, null);
                useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
