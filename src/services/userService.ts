import api from '@/lib/api';

export interface UserUpdateData {
    email?: string;
    department?: string;
    full_name?: string;
}

export interface PasswordChangeData {
    current_password: string;
    new_password: string;
}

export const userService = {
    updateProfile: async (data: UserUpdateData) => {
        const response = await api.patch('/auth/profile', data);
        return response.data;
    },
    changePassword: async (data: PasswordChangeData) => {
        const response = await api.post('/auth/change-password', data);
        return response.data;
    }
};
