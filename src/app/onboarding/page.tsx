'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import { onboardingService } from '@/services/onboardingService';
import {
    UserPlusIcon,
    ClipboardDocumentCheckIcon,
    ChatBubbleLeftRightIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';

export default function OnboardingPage() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const data = await onboardingService.listEmployees();
            setEmployees(data);
        } catch (err) {
            setError('Failed to load onboarding employees');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Onboarding Hub</h1>
                    <p className="text-gray-500 font-medium italic">Streamline the new hire experience with AI-powered checklists and guides.</p>
                </div>
                <Button variant="primary" className="shadow-lg">
                    <UserPlusIcon className="w-5 h-5 mr-2" />
                    New Hire
                </Button>
            </div>

            {error && <Alert variant="error" title="Error">{error}</Alert>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="hover:shadow-md transition-shadow" title="Quick Stats">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1 border-r border-gray-100 last:border-0 p-2">
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Active</p>
                            <p className="text-2xl font-black text-gray-900">{employees.filter(e => e.status !== 'completed').length}</p>
                        </div>
                        <div className="space-y-1 p-2">
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Success Rate</p>
                            <p className="text-2xl font-black text-green-600">98%</p>
                        </div>
                    </div>
                </Card>

                <Card title="AI Checklist Assistant" className="bg-slate-900 text-white border-none shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <ClipboardDocumentCheckIcon className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-bold italic opacity-80 leading-tight">Generate custom checklists based on job role & seniority.</p>
                    </div>
                    <Button variant="ghost" className="w-full bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest">Open Template Builder</Button>
                </Card>

                <Card title="Employee Feedback" className="border-blue-100 bg-blue-50/20">
                    <div className="flex items-center gap-2 mb-2">
                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />
                        <p className="text-sm font-bold text-gray-900">Recent Pulse</p>
                    </div>
                    <p className="text-xs text-gray-500 italic">"The AI assistant helped me find the health insurance documents instantly!"</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mt-2">— Sarah Mitchell, UX Designer</p>
                </Card>
            </div>

            <Card title="Active Onboarding Pipeline" subtitle="Track progress for all current new hires.">
                {loading ? (
                    <div className="flex justify-center py-20"><Spinner /></div>
                ) : employees.length === 0 ? (
                    <div className="text-center py-20 grayscale opacity-40 italic font-medium">No active onboarding found.</div>
                ) : (
                    <Table>
                        <THead>
                            <TR>
                                <TH>Employee</TH>
                                <TH>Department</TH>
                                <TH>Progress</TH>
                                <TH>Status</TH>
                                <TH className="text-right">Actions</TH>
                            </TR>
                        </THead>
                        <TBody>
                            {employees.map((emp) => (
                                <TR key={emp.id}>
                                    <TD className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-500 uppercase tracking-tighter">
                                            {emp.first_name?.[0]}{emp.last_name?.[0]}
                                        </div>
                                        <span className="font-bold text-gray-900">{emp.first_name} {emp.last_name}</span>
                                    </TD>
                                    <TD className="text-xs font-bold uppercase tracking-widest text-gray-400">{emp.department || 'N/A'}</TD>
                                    <TD className="w-48">
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: '45%' }}></div>
                                        </div>
                                    </TD>
                                    <TD><Badge variant="info">In Progress</Badge></TD>
                                    <TD className="text-right">
                                        <Button variant="ghost" size="sm" className="font-bold text-xs uppercase tracking-widest text-blue-600">Track Detail</Button>
                                    </TD>
                                </TR>
                            ))}
                        </TBody>
                    </Table>
                )}
            </Card>
        </div>
    );
}
