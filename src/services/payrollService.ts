import api from '@/lib/api';

export const payrollService = {
    getSummary: async () => {
        const response = await api.get('/payroll/summary');
        return response.data;
    },
    validate: async (data: any) => {
        const response = await api.post('/payroll/validate', data);
        return response.data;
    },
    calculate: async (data: any) => {
        const response = await api.post('/payroll/calculate', data);
        return response.data;
    },
    calculateBulk: async (data: any) => {
        const response = await api.post('/payroll/calculate-bulk', data);
        return response.data;
    },
    getHistory: async (employeeId: number) => {
        const response = await api.get(`/payroll/history/${employeeId}`);
        return response.data;
    },
    getDetails: async (payrollId: number) => {
        const response = await api.get(`/payroll/${payrollId}`);
        return response.data;
    },
    askQuestion: async (question: string) => {
        const response = await api.post('/payroll/ask', { question });
        return response.data;
    },
    lockPeriod: async (data: any) => {
        const response = await api.post('/payroll/lock', data);
        return response.data;
    },
    explainPayslip: async (payrollId: number) => {
        const response = await api.post(`/payroll/explain/${payrollId}`);
        return response.data;
    },
    downloadPdf: async (payrollId: number) => {
        const response = await api.get(`/payroll/payslip/${payrollId}/pdf`, {
            responseType: 'blob'
        });
        return response.data;
    }
};
