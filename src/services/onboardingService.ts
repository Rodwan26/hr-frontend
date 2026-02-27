import api from '@/lib/api';

export type OnboardingTaskCategory = 'documentation' | 'training' | 'setup' | 'meeting' | 'other';

export interface OnboardingTask {
    id: number;
    task_title: string;
    task_description: string;
    is_completed: boolean;
    due_date?: string;
    task_category?: OnboardingTaskCategory | string;
    completed_at?: string;
}

export interface OnboardingProgress {
    total_tasks: number;
    completed_tasks: number;
    completion_percentage: number;
    overdue_tasks: Array<{
        task_id: number;
        title: string;
        due_date: string;
    }>;
}

export interface OnboardingDocument {
    id: number;
    document_name: string;
    document_type: string;
    is_signed: boolean;
}

export interface OnboardingEmployee {
    id: number;
    employee_name: string;
    employee_email: string;
    department: string;
    position: string;
    start_date: string;
    onboarding_status: string;
    status: 'pending' | 'in_progress' | 'completed';
    completion_percentage: number;
}

export interface OnboardingChat {
    id: number;
    question: string;
    ai_response: string;
    is_helpful: boolean | null;
    created_at: string;
}

export interface OnboardingAskResponse {
    answer: string;
    confidence: number;
    sources: Array<{ filename: string; chunk_index: number }>;
}

export interface OnboardingTips {
    motivation: string;
    tips: string[];
    next_actions: string[];
}

export const onboardingService = {
    listEmployees: async () => {
        const response = await api.get('/onboarding/employees');
        return response.data;
    },
    createEmployee: async (data: any) => {
        const response = await api.post('/onboarding/employees', data);
        return response.data;
    },
    getEmployee: async (id: number) => {
        const response = await api.get(`/onboarding/employees/${id}`);
        return response.data;
    },
    generateChecklist: async (id: number) => {
        const response = await api.post(`/onboarding/employees/${id}/generate-checklist`);
        return response.data;
    },
    getTasks: async (employeeId: number): Promise<OnboardingTask[]> => {
        const response = await api.get(`/onboarding/employees/${employeeId}/tasks`);
        return response.data;
    },
    getMyTasks: async (): Promise<OnboardingTask[]> => {
        const response = await api.get('/onboarding/me/tasks');
        return response.data;
    },
    createTask: async (employeeId: number, data: any) => {
        const response = await api.post(`/onboarding/employees/${employeeId}/tasks`, data);
        return response.data;
    },
    completeTask: async (taskId: number) => {
        const response = await api.put(`/onboarding/tasks/${taskId}/complete`);
        return response.data;
    },
    deleteTask: async (taskId: number) => {
        const response = await api.delete(`/onboarding/tasks/${taskId}`);
        return response.data;
    },
    getDocuments: async (employeeId: number): Promise<OnboardingDocument[]> => {
        const response = await api.get(`/onboarding/employees/${employeeId}/documents`);
        return response.data;
    },
    getMyDocuments: async (): Promise<OnboardingDocument[]> => {
        const response = await api.get('/onboarding/me/documents');
        return response.data;
    },
    signDocument: async (docId: number) => {
        const response = await api.put(`/onboarding/documents/${docId}/sign`);
        return response.data;
    },
    getChatHistory: async (employeeId: number): Promise<OnboardingChat[]> => {
        const response = await api.get(`/onboarding/employees/${employeeId}/chat-history`);
        return response.data;
    },
    askOnboarding: async (employeeId: number, question: string): Promise<OnboardingAskResponse> => {
        const response = await api.post(`/onboarding/employees/${employeeId}/ask`, { question });
        return response.data;
    },
    setChatFeedback: async (chatId: number, isHelpful: boolean) => {
        const response = await api.put(`/onboarding/chats/${chatId}/feedback`, { is_helpful: isHelpful });
        return response.data;
    },
    getTips: async (employeeId: number): Promise<OnboardingTips> => {
        const response = await api.get(`/onboarding/employees/${employeeId}/tips`);
        return response.data;
    },
    getProgress: async (employeeId: number) => {
        const response = await api.get(`/onboarding/employees/${employeeId}/progress`);
        return response.data;
    },
    listTemplates: async () => {
        const response = await api.get('/onboarding/templates');
        return response.data;
    },
    applyTemplate: async (employeeId: number, templateId: number) => {
        const response = await api.post(`/onboarding/employees/${employeeId}/apply-template/${templateId}`);
        return response.data;
    }
};
