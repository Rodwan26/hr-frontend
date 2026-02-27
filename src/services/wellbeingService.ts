import api from '@/lib/api';

export const wellbeingService = {
    assessEmployee: async (employeeId: number) => {
        const response = await api.post(`/wellbeing/analyze/${employeeId}`);
        return response.data;
    },
    checkFriction: async (text: string) => {
        const response = await api.post('/wellbeing/check-friction', { text });
        return response.data;
    },
    async getWellbeingHistory(employeeId: number) {
        const response = await api.get(`/wellbeing/assessments/${employeeId}`);
        return response.data;
    },
    async getWellbeingTip() {
        const response = await api.get('/wellbeing/tip');
        return response.data;
    }
};
