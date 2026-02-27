import api from '@/lib/api';

export interface Notification {
    id: number;
    user_id: number;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    link?: string;
    is_read: boolean;
    created_at: string;
}

export const notificationService = {
    getNotifications: async (unread_only: boolean = false): Promise<Notification[]> => {
        const response = await api.get('/notifications/', {
            params: { unread_only }
        });
        return response.data;
    },

    markAsRead: async (id: number): Promise<Notification> => {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async (): Promise<void> => {
        await api.post('/notifications/mark-all-read');
    }
};
