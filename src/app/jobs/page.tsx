'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { recruitmentService, Job } from '@/services/recruitmentService';
import { Modal } from '@/components/ui/Modal';
import { useRouter } from 'next/navigation';
import {
    BriefcaseIcon,
    MapPinIcon,
    BuildingOfficeIcon,
    UserPlusIcon,
    ChevronRightIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

export default function JobsPage() {
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        department: 'Engineering',
        location: 'Remote',
        description: '',
        requirements: '',
        experience_level: 'Mid-level',
        employment_type: 'Full-time'
    });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const data = await recruitmentService.getJobs();
            setJobs(data);
        } catch (err) {
            setError('Failed to load job listings');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setError(null);
        try {
            await recruitmentService.createJob({
                ...formData,
                is_active: true,
                status: 'open'
            });
            setIsModalOpen(false);
            setFormData({
                title: '',
                department: 'Engineering',
                location: 'Remote',
                description: '',
                requirements: '',
                experience_level: 'Mid-level',
                employment_type: 'Full-time'
            });
            fetchJobs();
        } catch (err) {
            setError('Failed to create job posting');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Active Opportunities</h1>
                    <p className="text-gray-500 font-medium italic">Manage open positions and track candidate flow across departments.</p>
                </div>
                <Button
                    variant="primary"
                    className="shadow-lg hover:shadow-xl"
                    onClick={() => setIsModalOpen(true)}
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Post New Job
                </Button>
            </div>

            {error && <Alert variant="error" title="Error" onClose={() => setError(null)}>{error}</Alert>}

            {loading ? (
                <div className="flex justify-center py-40"><Spinner size="lg" /></div>
            ) : jobs.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-32 text-center border-dashed border-2">
                    <BuildingOfficeIcon className="w-16 h-16 text-gray-200 mb-4" />
                    <h3 className="text-xl font-bold text-gray-400">No Open Postings</h3>
                    <p className="text-sm text-gray-400 font-medium italic">Start by creating your first job requisition.</p>
                    <Button
                        variant="outline"
                        className="mt-6 font-bold uppercase text-xs tracking-widest"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Create Template
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {jobs.map((job) => (
                        <Card
                            key={job.id}
                            className="hover:shadow-md transition-all group border-l-4 border-l-blue-600 cursor-pointer active:scale-[0.99]"
                            onClick={() => router.push(`/jobs/${job.id}`)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex gap-6">
                                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                        <BriefcaseIcon className="w-7 h-7" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-xl font-black text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors uppercase">{job.title}</h4>
                                        <div className="flex items-center gap-4 text-sm font-semibold text-gray-400 italic">
                                            <span className="flex items-center gap-1.5"><MapPinIcon className="w-4 h-4" /> {job.location || 'Global Remote'}</span>
                                            <span className="flex items-center gap-1.5"><BuildingOfficeIcon className="w-4 h-4" /> {job.department || 'Tech & Product'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="hidden md:flex flex-col items-center gap-1">
                                        <span className="text-2xl font-black text-gray-900">0</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Applicants</span>
                                    </div>
                                    <div className="hidden md:flex flex-col items-center gap-1">
                                        <Badge variant={job.status === 'open' ? 'success' : 'warning'} className="px-3">{job.status}</Badge>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Since {new Date(job.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                                        <ChevronRightIcon className="w-6 h-6 text-gray-300 group-hover:text-blue-600" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Job Posting"
            >
                <form onSubmit={handleCreateJob} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Job Title</label>
                        <input
                            required
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Senior Frontend Engineer"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Department</label>
                            <input
                                required
                                type="text"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Location</label>
                            <input
                                required
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Description</label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm h-32 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <Button type="submit" className="w-full" loading={creating}>
                        Publish Opportunity
                    </Button>
                </form>
            </Modal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card title="Talent Pipeline Health" className="bg-slate-900 text-white border-none shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 blur-3xl" />
                    <div className="space-y-4">
                        <div className="flex items-center justify-between opacity-80">
                            <span className="text-xs font-bold uppercase tracking-widest">Time to Hire</span>
                            <span className="text-xl font-black">24 Days <span className="text-green-400 text-xs">↓2</span></span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2">
                            <div className="bg-blue-500 h-full rounded-full w-[75%]" />
                        </div>
                        <p className="text-[10px] italic text-slate-400">Target: 21 Days. AI optimization flow recommended.</p>
                    </div>
                </Card>

                <Card title="Quick Candidate Search" subtitle="Instantly find applicants across all active roles.">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Seach by name, skill, or role..."
                            className="w-full h-12 bg-gray-50 border border-gray-100 p-4 pl-12 rounded-xl text-sm italic font-medium focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        />
                        <UserPlusIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                </Card>
            </div>
        </div>
    );
}
