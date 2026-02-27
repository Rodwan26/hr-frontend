import api from '@/lib/api';

export interface LeaveBalance {
    id: number;
    leave_type: string;
    total_days: number;
    used_days: number;
    remaining_days: number;
    year: number;
}

export interface LeaveRequest {
    id: number;
    employee_id: number;
    start_date: string;
    end_date: string;
    leave_type: string;
    days_count: number;
    status: string;
    conflict_detected: boolean;
    ai_decision?: string;
    ai_reasoning?: string;
}

export const leaveService = {
    getLeaveBalance: async (employeeId: number) => {
        const response = await api.get(`/leave/balance/${employeeId}`);
        return response.data;
    },
    getLeaveRequests: async (employeeId: number) => {
        const response = await api.get(`/leave/requests/${employeeId}`);
        return response.data;
    },
    checkLeaveEligibility: async (data: { leave_type: string; days_requested: number }) => {
        const response = await api.post('/leave/eligibility', data);
        return response.data;
    },
    submitLeaveRequest: async (data: { start_date: string; end_date: string; leave_type: string }) => {
        const response = await api.post('/leave/requests', data);
        return response.data;
    },
    approveLeaveRequest: async (requestId: number, approve: boolean, comment?: string) => {
        const response = await api.post('/leave/approve', {
            request_id: requestId,
            approve,
            comment
        });
        return response.data;
    },
    getCalendar: async () => {
        const response = await api.get('/leave/calendar');
        return response.data;
    }
};
