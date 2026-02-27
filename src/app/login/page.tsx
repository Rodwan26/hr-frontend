'use client';

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/forms/FormField';
import { Alert } from '@/components/ui/Alert';
import { authService } from '@/services/authService';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type LoginData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const message = searchParams.get('message');

    const methods = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginData) => {
        setLoading(true);
        setError(null);
        try {
            await authService.login(data.email, data.password);
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.detail || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20 mb-4 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                        <span className="text-2xl font-black text-white">HR</span>
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h1>
                    <p className="text-gray-500 mt-2 font-medium">Please sign in to your HR account.</p>
                </div>

                <Card>
                    <FormProvider {...methods}>
                        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-5">
                            {message && <Alert variant="success" title="Success">{message}</Alert>}
                            {error && <Alert variant="error" title="Login Failed">{error}</Alert>}

                            <FormField
                                name="email"
                                label="Email Address"
                                type="email"
                                placeholder="you@company.com"
                            />

                            <FormField
                                name="password"
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                            />

                            <div className="flex items-center justify-end">
                                <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                                    Forgot password?
                                </button>
                            </div>

                            <Button type="submit" className="w-full h-11 text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0" loading={loading}>
                                Sign In
                            </Button>
                        </form>
                    </FormProvider>
                </Card>

                <p className="text-center mt-8 text-sm text-gray-500">
                    Don&apos;t have an account?{' '}
                    <button onClick={() => router.push('/setup')} className="font-bold text-gray-900 hover:text-blue-600 transition-colors">
                        Setup System
                    </button>
                </p>
            </div>
        </div>
    );
}
