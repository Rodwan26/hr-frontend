'use client';

import React, { useState, useEffect } from 'react';
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

interface ErrorDetail {
    type: string;
    field?: string;
    message: string;
    suggestions?: string[];
    action?: {
        type: string;
        url: string;
    };
}

export default function SetupPage() {
    const [error, setError] = useState<string | null>(null);
    const [errorType, setErrorType] = useState<'duplicate_email' | 'duplicate_org' | 'other' | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [slugError, setSlugError] = useState<string | null>(null);
    const [slugSuggestions, setSlugSuggestions] = useState<string[]>([]);
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

    // Auto-generate slug from organization name
    useEffect(() => {
        const subscription = methods.watch((value, { name }) => {
            if (name === 'organization_name' && value.organization_name) {
                const generatedSlug = value.organization_name
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .substring(0, 30);
                methods.setValue('organization_slug', generatedSlug, { shouldValidate: true });
            }
        });
        return () => subscription.unsubscribe();
    }, [methods]);

    // Check system status - allow viewing page always
    useEffect(() => {
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

    const parseError = (err: any): void => {
        // Clear previous field errors
        setEmailError(null);
        setSlugError(null);
        setSlugSuggestions([]);
        setError(null);
        setErrorType(null);

        const responseData = err.response?.data;
        
        // Handle new structured error format (type at root level)
        if (responseData?.type) {
            switch (responseData.type) {
                case 'EMAIL_EXISTS':
                    setEmailError(responseData.message);
                    setErrorType('duplicate_email');
                    break;
                    
                case 'SLUG_EXISTS':
                    setSlugError(responseData.message);
                    if (responseData.suggestions) {
                        setSlugSuggestions(responseData.suggestions);
                    }
                    setErrorType('duplicate_org');
                    break;
                    
                default:
                    setError(responseData.message || 'An unexpected error occurred. Please try again.');
                    setErrorType('other');
            }
            return;
        }
        
        // Handle legacy format (detail wrapper)
        const detail = responseData?.detail;
        
        // Handle structured error response (detail as object)
        if (typeof detail === 'object' && detail !== null) {
            switch (detail.type) {
                case 'EMAIL_EXISTS':
                    setEmailError(detail.message);
                    setErrorType('duplicate_email');
                    break;
                    
                case 'SLUG_EXISTS':
                    setSlugError(detail.message);
                    if (detail.suggestions) {
                        setSlugSuggestions(detail.suggestions);
                    }
                    setErrorType('duplicate_org');
                    break;
                    
                default:
                    setError(detail.message || 'An unexpected error occurred. Please try again.');
                    setErrorType('other');
            }
            return;
        }
        
        // Handle legacy string format (backward compatibility)
        if (typeof detail === 'string') {
            if (detail.toLowerCase().includes('email')) {
                setEmailError('This email is already registered.');
                setErrorType('duplicate_email');
            } else if (detail.toLowerCase().includes('name') || detail.toLowerCase().includes('slug')) {
                setSlugError('This organization name is already taken.');
                setErrorType('duplicate_org');
            } else {
                setError(detail || 'Failed to create organization. Please try again.');
                setErrorType('other');
            }
            return;
        }
        
        // Fallback for network errors
        setError('Network error. Please check your connection and try again.');
        setErrorType('other');
    };

    const onSubmit = async (data: SetupData) => {
        setLoading(true);
        setEmailError(null);
        setSlugError(null);
        setSlugSuggestions([]);
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
            parseError(err);
        } finally {
            setLoading(false);
        }
    };

    const applySlugSuggestion = (suggestion: string) => {
        methods.setValue('organization_slug', suggestion, { shouldValidate: true });
        setSlugError(null);
        setSlugSuggestions([]);
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
                            {/* Global Error Banner - Only for unexpected errors */}
                            {error && errorType === 'other' && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0">
                                            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-red-800 font-medium">{error}</p>
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
                                
                                {/* Organization Slug with Smart Suggestions */}
                                <div className="space-y-1">
                                    <FormField
                                        name="organization_slug"
                                        label="Organization Slug"
                                        placeholder="acme-corp"
                                        helperText="Used in your unique URL"
                                        error={slugError}
                                    />
                                    
                                    {/* Smart Suggestions */}
                                    {slugSuggestions.length > 0 && slugError && (
                                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                                            <span className="text-xs text-gray-500">Try instead:</span>
                                            <div className="flex gap-1 flex-wrap">
                                                {slugSuggestions.slice(0, 4).map((suggestion) => (
                                                    <button
                                                        key={suggestion}
                                                        type="button"
                                                        onClick={() => applySlugSuggestion(suggestion)}
                                                        className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md hover:bg-indigo-100 border border-indigo-200 transition-colors"
                                                    >
                                                        {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-6 mt-6">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest bg-gray-50 inline-block px-2 py-1 rounded">HR Admin Account</h4>
                                <div className="space-y-4">
                                    {/* Email Field with Login Action */}
                                    <div className="relative">
                                        <FormField
                                            name="admin_email"
                                            label="Admin Email"
                                            type="email"
                                            placeholder="admin@company.com"
                                            error={emailError}
                                        />
                                        
                                        {/* Quick Login Action */}
                                        {emailError && (
                                            <div className="mt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => router.push('/login')}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline"
                                                >
                                                    Login instead?
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <FormField
                                        name="admin_password"
                                        label="Admin Password"
                                        type="password"
                                        placeholder="Minimum 8 characters"
                                    />
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full h-12 text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5" 
                                loading={loading}
                            >
                                Create Organization
                            </Button>
                        </form>
                    </FormProvider>
                </Card>
            </div>
        </div>
    );
}
