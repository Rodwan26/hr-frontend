'use client';

import React from 'react';
import { useAuthStore } from '@/store/authStore';

interface PermissionGuardProps {
    roles?: string[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * RBAC Guard Component
 * - Shows children only if user has one of the allowed roles
 * - Defaults to showing nothing if not authorized
 */
export function PermissionGuard({ roles, children, fallback = null }: PermissionGuardProps) {
    const { user, isAuthenticated } = useAuthStore();

    if (!isAuthenticated || !user) {
        return <>{fallback}</>;
    }

    if (roles && !roles.includes(user.role)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
