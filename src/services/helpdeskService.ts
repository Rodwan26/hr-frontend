import api from '@/lib/api';

export interface Ticket {
    id: number;
    question: string;
    ai_response: string;
    created_at: string;
    status: string;
}

export const helpdeskService = {
    ask: async (question: string) => {
        // AI can take longer than the default 15s, so we override timeout to 60s
        const response = await api.post('/helpdesk/ask', { question }, { timeout: 60000 });
        return response.data;
    },
    getHistory: async () => {
        const response = await api.get('/helpdesk/tickets');
        return response.data;
    }
};
