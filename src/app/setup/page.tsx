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
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
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

    // Check if system is already initialized
    React.useEffect(() => {
        const checkStatus = async () => {
            try {
                const status = await setupService.checkStatus();
                if (status.initialized) {
                    // If system already has organization, redirect to login
                    router.push('/login?message=System already initialized. Please login.');
                }
            } catch (err) {
                console.error('Failed to check setup status:', err);
            } finally {
                setCheckingStatus(false);
            }
        };
        checkStatus();
    }, [router]);

    const onSubmit = async (data: SetupData) => {
        setLoading(true);
        setError(null);
        try {
            const payload = {
                organization_name: data.organization_name,
                admin_name: data.admin_email.split('@')[0],
                admin_email: data.admin_email,
                password: data.admin_password,
            };

            await setupService.initialize(payload);
            router.push('/login?message=System initialized successfully. Please login.');
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            if (err.response?.status === 400 && detail?.includes('already initialized')) {
                router.push('/login?message=System already initialized. Please login.');
            } else {
                setError(detail || 'Failed to initialize system. Please try again.');
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
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">System Setup</h1>
                    <p className="text-gray-500 mt-2 font-medium italic">Welcome to your new HR AI Platform instance.</p>
                </div>

                <Card title="Initialize Organization" subtitle="Set up your primary organization and HR administrator account.">
                    <FormProvider {...methods}>
                        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
                            {error && <Alert variant="error" title="Setup Failed">{error}</Alert>}

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
                                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest bg-gray-50 inline-block px-2 py-1 rounded">Primary HR Admin</h4>
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
                                Initialize System
                            </Button>
                        </form>
                    </FormProvider>
                </Card>
            </div>
        </div>
    );
}
