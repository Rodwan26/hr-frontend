import api from '@/lib/api';

export const riskService = {
    getRiskClusters: async () => {
        const response = await api.get('/risk/clusters');
        return response.data;
    },
    getTrends: async () => {
        const response = await api.get('/risk/trends');
        return response.data;
    }
};
