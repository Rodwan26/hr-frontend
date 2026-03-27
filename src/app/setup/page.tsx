'use client';

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/forms/FormField';
import { Alert } from '@/components/ui/Alert';
import { setupService } from '@/services/setupService';

const setupSchema = z.object({
    organization_name: z.string().min(2, 'Organization name is too short'),
    organization_slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    admin_email: z.string().email('Invalid email address'),
    admin_password: z.string().min(8, 'Password must be at least 8 characters'),
});

type SetupData = z.infer<typeof setupSchema>;

export default function SetupPage() {
    const [error, setError] = useState<string | null>(null);
    const [errorType, setErrorType] = useState<'duplicate_email' | 'duplicate_org' | 'other' | null>(null);
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [organizationsCount, setOrganizationsCount] = useState(0);
    const router = useRouter();

    const methods = useForm<SetupData>({
        resolver: zodResolver(setupSchema),
        defaultValues: {
            organization_name: '',
            organization_slug: '',
            admin_email: '',
            admin_password: '',
        },
    });

    // Check system status - allow viewing page always
    React.useEffect(() => {
        const checkStatus = async () => {
            try {
                const status = await setupService.checkStatus();
                setOrganizationsCount(status.organizations_count || 0);
            } catch (err) {
                console.error('Failed to check setup status:', err);
            } finally {
                setCheckingStatus(false);
            }
        };
        checkStatus();
    }, []);

    const onSubmit = async (data: SetupData) => {
        setLoading(true);
        setError(null);
        setErrorType(null);
        try {
            const payload = {
                organization_name: data.organization_name,
                admin_name: data.admin_email.split('@')[0],
                admin_email: data.admin_email,
                password: data.admin_password,
            };

            const response = await setupService.initialize(payload);
            router.push(`/login?message=Organization '${response.organization_name}' created successfully! Please login.`);
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            
            if (detail && detail.includes('email already exists')) {
                setErrorType('duplicate_email');
                setError('هذا البريد الإلكتروني مسجل مسبقاً في النظام.');
            } else if (detail && detail.includes('organization with this name already exists')) {
                setErrorType('duplicate_org');
                setError('يوجد شركة بنفس الاسم. اختر اسم مختلف.');
            } else {
                setErrorType('other');
                setError(detail || 'فشل إنشاء المؤسسة. يرجى المحاولة مرة أخرى.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (checkingStatus) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-xl">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Create Organization</h1>
                    <p className="text-gray-500 mt-2 font-medium italic">
                        {organizationsCount > 0 
                            ? `Your system has ${organizationsCount} organization(s). Create a new one to get started.`
                            : 'Set up your first organization to get started.'
                        }
                    </p>
                </div>

                {organizationsCount > 0 && (
                    <div className="mb-6">
                        <Alert variant="info" title="Multi-Tenant System">
                            This is a multi-tenant system. You can create multiple organizations, each with its own independent data.
                        </Alert>
                        <div className="mt-3 text-center">
                            <button 
                                onClick={() => router.push('/login')} 
                                className="text-sm text-indigo-600 hover:text-indigo-800 underline"
                            >
                                Already have an account? Login here
                            </button>
                        </div>
                    </div>
                )}

                <Card title="New Organization" subtitle="Create a new organization with an HR admin account.">
                    <FormProvider {...methods}>
                        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-red-800 font-medium">{error}</p>
                                            
                                            {errorType === 'duplicate_email' && (
                                                <button
                                                    type="button"
                                                    onClick={() => router.push('/login')}
                                                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium underline"
                                                >
                                                    هل تريد تسجيل الدخول بدلاً من ذلك؟
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    name="organization_name"
                                    label="Organization Name"
                                    placeholder="e.g. Acme Corp"
                                />
                                <FormField
                                    name="organization_slug"
                                    label="Organization Slug"
                                    placeholder="acme-corp"
                                    helperText="Used in your unique URL"
                                />
                            </div>

                            <div className="border-t border-gray-100 pt-6 mt-6">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest bg-gray-50 inline-block px-2 py-1 rounded">HR Admin Account</h4>
                                <div className="space-y-4">
                                    <FormField
                                        name="admin_email"
                                        label="Admin Email"
                                        type="email"
                                        placeholder="admin@company.com"
                                    />
                                    <FormField
                                        name="admin_password"
                                        label="Admin Password"
                                        type="password"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-12 text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5" loading={loading}>
                                Create Organization
                            </Button>
                        </form>
                    </FormProvider>
                </Card>
            </div>
        </div>
    );
}
