/**
 * Frontend Configuration Module
 * 
 * API URLs:
 * - Development: http://localhost:8000
 * - Production: Set NEXT_PUBLIC_API_URL in Vercel environment variables
 */

const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === 'true';

export const config = {
    // API Base URL - MUST be set in Vercel environment variables for production
    // Fallback to localhost for development
    apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 
        (isProduction ? "https://hr-ai-platform-backend.onrender.com" : "http://localhost:8000"),
    
    apiPrefix: "/api",
    requestIdHeader: "X-Request-ID",
    auth: {
        tokenKey: "auth_token",
        refreshTokenKey: "refresh_token",
    },
    resilience: {
        maxRetries: 3,
        retryDelayBase: 1000, // ms
        slowRequestThreshold: 2000, // ms
        timeout: 30000, // 30 seconds timeout for production
    },
    environment: process.env.NODE_ENV || "development",
};

export const getApiUrl = (path: string) => {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${config.apiBaseUrl}${config.apiPrefix}${cleanPath}`;
};

// Log configuration on initialization
if (typeof window !== 'undefined') {
    console.log(`[API Config] Environment: ${config.environment}`);
    console.log(`[API Config] Base URL: ${config.apiBaseUrl}`);
}
