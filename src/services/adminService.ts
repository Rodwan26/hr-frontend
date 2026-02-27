import api from '@/lib/api';

export const adminService = {
    // Audit Logs
    getAuditLogs: async (params?: any) => {
        const response = await api.get('/admin/audit-logs', { params });
        return response.data;
    },

    getSummary: async () => {
        const response = await api.get('/admin/summary');
        return response.data;
    },

    // Departments
    getDepartments: async () => {
        const response = await api.get('/departments');
        return response.data;
    },
    getDepartmentTree: async () => {
        const response = await api.get('/departments/tree');
        return response.data;
    },
    createDepartment: async (data: any) => {
        const response = await api.post('/departments', data);
        return response.data;
    },
    updateDepartment: async (id: number, data: any) => {
        const response = await api.patch(`/departments/${id}`, data);
        return response.data;
    },
    deleteDepartment: async (id: number) => {
        const response = await api.delete(`/departments/${id}`);
        return response.data;
    }
};
