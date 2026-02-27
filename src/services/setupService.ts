import api from '@/lib/api';

export interface SetupPayload {
    organization_name: string;
    admin_name: string;
    admin_email: string;
    password: string;
}

export const setupService = {
    initialize: async (data: SetupPayload) => {
        const response = await api.post('/setup/initialize', data);
        return response.data;
    },
    checkStatus: async () => {
        const response = await api.get('/setup/status');
        return response.data;
    }
};
