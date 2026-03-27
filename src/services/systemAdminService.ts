import api from '@/lib/api';

// =============================================================================
// Types
// =============================================================================

export interface SystemStatus {
    total_organizations: number;
    total_users: number;
    total_active_users: number;
    total_inactive_users: number;
    system_admin_email: string;
}

export interface OrganizationSummary {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    created_at: string;
    users_count: number;
    employees_count: number;
}

export interface UserSummary {
    id: number;
    email: string;
    full_name: string | null;
    role: string;
    organization_id: number | null;
    organization_name: string | null;
    is_active: boolean;
    created_at: string;
}

export interface DeleteResponse {
    success: boolean;
    message: string;
    deleted_id: number;
}

// =============================================================================
// API Service
// =============================================================================

export const systemAdminService = {
    /**
     * Get overall system status and statistics
     */
    getSystemStatus: async (): Promise<SystemStatus> => {
        const response = await api.get('/system/status');
        return response.data;
    },

    /**
     * Get all organizations with user and employee counts
     */
    getOrganizations: async (): Promise<OrganizationSummary[]> => {
        const response = await api.get('/system/organizations');
        return response.data;
    },

    /**
     * Get all users with their organization information
     */
    getUsers: async (params?: {
        role_filter?: string;
        org_filter?: number;
    }): Promise<UserSummary[]> => {
        const response = await api.get('/system/users', { params });
        return response.data;
    },

    /**
     * Delete an organization and all its related data
     * WARNING: This will permanently delete all data for this organization
     */
    deleteOrganization: async (orgId: number): Promise<DeleteResponse> => {
        const response = await api.delete(`/system/organizations/${orgId}`);
        return response.data;
    },

    /**
     * Delete a user account
     * Cannot delete other SUPER_ADMIN users
     */
    deleteUser: async (userId: number): Promise<DeleteResponse> => {
        const response = await api.delete(`/system/users/${userId}`);
        return response.data;
    },

    /**
     * Deactivate a user account (soft delete)
     */
    deactivateUser: async (userId: number): Promise<UserSummary> => {
        const response = await api.patch(`/system/users/${userId}/deactivate`);
        return response.data;
    },

    /**
     * Activate a user account
     */
    activateUser: async (userId: number): Promise<UserSummary> => {
        const response = await api.patch(`/system/users/${userId}/activate`);
        return response.data;
    },
};
