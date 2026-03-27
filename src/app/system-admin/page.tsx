'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { systemAdminService, SystemStatus, OrganizationSummary, UserSummary } from '@/services/systemAdminService';
import {
    BuildingOfficeIcon,
    UsersIcon,
    UserCircleIcon,
    TrashIcon,
    ShieldCheckIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

type TabType = 'overview' | 'organizations' | 'users';

export default function SystemAdminPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Data states
    const [status, setStatus] = useState<SystemStatus | null>(null);
    const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
    const [users, setUsers] = useState<UserSummary[]>([]);
    
    // Delete confirmation modal
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        type: 'organization' | 'user';
        id: number;
        name: string;
    } | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Check authentication and role
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        
        if (user?.role !== 'SUPER_ADMIN') {
            router.push('/dashboard');
            return;
        }
        
        loadData();
    }, [isAuthenticated, user]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const [statusData, orgsData, usersData] = await Promise.all([
                systemAdminService.getSystemStatus(),
                systemAdminService.getOrganizations(),
                systemAdminService.getUsers()
            ]);
            
            setStatus(statusData);
            setOrganizations(orgsData);
            setUsers(usersData);
        } catch (err: any) {
            console.error('Failed to load data:', err);
            setError(err.response?.data?.detail || 'Failed to load system data');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal) return;
        
        setDeleting(true);
        try {
            if (deleteModal.type === 'organization') {
                await systemAdminService.deleteOrganization(deleteModal.id);
            } else {
                await systemAdminService.deleteUser(deleteModal.id);
            }
            
            // Reload data
            await loadData();
            setDeleteModal(null);
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to delete');
        } finally {
            setDeleting(false);
        }
    };

    const handleToggleUserStatus = async (userData: UserSummary) => {
        try {
            if (userData.is_active) {
                await systemAdminService.deactivateUser(userData.id);
            } else {
                await systemAdminService.activateUser(userData.id);
            }
            await loadData();
        } catch (err: any) {
            alert(err.response?.data?.detail || 'Failed to update user');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
                    <p className="text-gray-500 mt-1">Manage organizations and users across the platform</p>
                </div>
                <button
                    onClick={loadData}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                    <ArrowPathIcon className="w-5 h-5" />
                    Refresh
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                {[
                    { id: 'overview', label: 'Overview', icon: ShieldCheckIcon },
                    { id: 'organizations', label: 'Organizations', icon: BuildingOfficeIcon },
                    { id: 'users', label: 'Users', icon: UsersIcon },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                            activeTab === tab.id
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <tab.icon className="w-5 h-5" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'overview' && status && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Organizations"
                        value={status.total_organizations}
                        icon={BuildingOfficeIcon}
                        color="blue"
                    />
                    <StatCard
                        title="Total Users"
                        value={status.total_users}
                        icon={UsersIcon}
                        color="green"
                    />
                    <StatCard
                        title="Active Users"
                        value={status.total_active_users}
                        icon={CheckCircleIcon}
                        color="emerald"
                    />
                    <StatCard
                        title="Inactive Users"
                        value={status.total_inactive_users}
                        icon={XCircleIcon}
                        color="red"
                    />
                </div>
            )}

            {activeTab === 'organizations' && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold">All Organizations</h2>
                        <p className="text-sm text-gray-500">{organizations.length} organizations total</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {organizations.map((org) => (
                                    <tr key={org.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900">{org.name}</div>
                                            <div className="text-xs text-gray-500">ID: {org.id}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{org.slug}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                {org.users_count}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                {org.employees_count}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {org.is_active ? (
                                                <span className="flex items-center gap-1 text-green-600 text-sm">
                                                    <CheckCircleIcon className="w-4 h-4" /> Active
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-red-600 text-sm">
                                                    <XCircleIcon className="w-4 h-4" /> Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => setDeleteModal({
                                                    show: true,
                                                    type: 'organization',
                                                    id: org.id,
                                                    name: org.name
                                                })}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete organization"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {organizations.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                            No organizations found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold">All Users</h2>
                        <p className="text-sm text-gray-500">{users.length} users total</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                                    {u.full_name?.[0] || u.email[0].toUpperCase()}
                                                </div>
                                                <div className="font-medium text-gray-900">{u.full_name || 'N/A'}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                u.role === 'SUPER_ADMIN' 
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {u.role.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {u.organization_name || (
                                                <span className="text-gray-400 italic">No organization</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {u.is_active ? (
                                                <span className="flex items-center gap-1 text-green-600 text-sm">
                                                    <CheckCircleIcon className="w-4 h-4" /> Active
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-red-600 text-sm">
                                                    <XCircleIcon className="w-4 h-4" /> Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {u.role !== 'SUPER_ADMIN' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleToggleUserStatus(u)}
                                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title={u.is_active ? 'Deactivate' : 'Activate'}
                                                        >
                                                            {u.is_active ? (
                                                                <XCircleIcon className="w-5 h-5 text-orange-500" />
                                                            ) : (
                                                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteModal({
                                                                show: true,
                                                                type: 'user',
                                                                id: u.id,
                                                                name: u.email
                                                            })}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete user"
                                                        >
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                            No users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal?.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
                                <p className="text-sm text-gray-500">
                                    {deleteModal.type === 'organization' ? 'Organization' : 'User'}
                                </p>
                            </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to delete <strong>{deleteModal.name}</strong>?
                            {deleteModal.type === 'organization' && (
                                <span className="block mt-2 text-red-600 text-sm">
                                    ⚠️ This will delete all associated data including users, employees, and all organization data.
                                </span>
                            )}
                        </p>
                        
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteModal(null)}
                                className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <TrashIcon className="w-4 h-4" />
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Stat Card Component
function StatCard({ 
    title, 
    value, 
    icon: Icon, 
    color 
}: { 
    title: string; 
    value: number; 
    icon: any; 
    color: string; 
}) {
    const colors: Record<string, { bg: string; icon: string }> = {
        blue: { bg: 'bg-blue-50', icon: 'text-blue-600' },
        green: { bg: 'bg-green-50', icon: 'text-green-600' },
        emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600' },
        red: { bg: 'bg-red-50', icon: 'text-red-600' },
    };
    
    const colorClasses = colors[color] || colors.blue;
    
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${colorClasses.bg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${colorClasses.icon}`} />
                </div>
                <div>
                    <p className="text-sm text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );
}
