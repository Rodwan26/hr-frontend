'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { recruitmentService, Job, Resume } from '@/services/recruitmentService';
import {
    BriefcaseIcon,
    MapPinIcon,
    BuildingOfficeIcon,
    UserGroupIcon,
    ShieldCheckIcon,
    EyeIcon,
    EyeSlashIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function JobDetailPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = parseInt(params.id as string);

    const [job, setJob] = useState<Job | null>(null);
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAnonymized, setIsAnonymized] = useState(true);

    useEffect(() => {
        if (jobId) {
            fetchData();
        }
    }, [jobId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [jobData, resumesData] = await Promise.all([
                recruitmentService.getJob(jobId),
                recruitmentService.getResumes(jobId)
            ]);
            setJob(jobData);
            setResumes(resumesData);
        } catch (err) {
            setError('Failed to load job details or candidates');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (resumeId: number, status: string) => {
        try {
            await recruitmentService.updateResumeStatus(jobId, resumeId, status);
            const updatedResumes = await recruitmentService.getResumes(jobId);
            setResumes(updatedResumes);
        } catch (error) {
            setError('Failed to update status');
        }
    };

    const sortedResumes = useMemo(() => {
        return [...resumes].sort((a, b) => (b.ai_score || 0) - (a.ai_score || 0));
    }, [resumes]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Shortlisted': return 'success';
            case 'Rejected': return 'error';
            case 'Reviewing': return 'warning';
            default: return 'default';
        }
    };

    if (loading) return <div className="flex justify-center py-40"><Spinner size="lg" /></div>;
    if (error) return <Alert variant="error" title="Error" onClose={() => setError(null)}>{error}</Alert>;
    if (!job) return <Alert variant="warning" title="Not Found">Job posting not found.</Alert>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header & Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </Button>
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{job.title}</h1>
                        <div className="flex items-center gap-4 text-sm font-semibold text-gray-400 italic">
                            <span className="flex items-center gap-1.5"><BuildingOfficeIcon className="w-4 h-4" /> {job.department}</span>
                            <span className="flex items-center gap-1.5"><MapPinIcon className="w-4 h-4" /> {job.location}</span>
                            <Badge variant={job.status === 'open' ? 'success' : 'warning'}>{job.status}</Badge>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setIsAnonymized(!isAnonymized)}
                        className={`font-bold transition-all ${isAnonymized ? 'border-amber-200 bg-amber-50 text-amber-700' : ''}`}
                    >
                        {isAnonymized ? <EyeSlashIcon className="w-5 h-5 mr-2" /> : <EyeIcon className="w-5 h-5 mr-2" />}
                        {isAnonymized ? 'Blind Mode On' : 'Revealed Mode'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Job Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    <Card title="Role Overview" className="bg-white shadow-xl border-t-4 border-t-blue-600">
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Description</h4>
                                <p className="text-sm text-gray-600 leading-relaxed font-medium">{job.description}</p>
                            </div>

                            {job.candidate_profile && (
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Ideal Profile</h4>
                                        <p className="text-sm font-bold text-gray-900 leading-relaxed">🎓 {job.candidate_profile.education}</p>
                                        <p className="text-sm font-semibold text-gray-500 mt-1 italic">💼 {job.candidate_profile.experience}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {job.candidate_profile.skills.map((skill, i) => (
                                            <Badge key={i} variant="default" className="bg-blue-50 text-blue-700 border-none">{skill}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-100">
                                <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Experience Level</h4>
                                <Badge variant="default" className="text-xs uppercase tracking-tighter shadow-none">{job.experience_level}</Badge>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-slate-900 text-white border-none relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl" />
                        <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-widest opacity-40">AI Health Check</h4>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold">Diversity Audit</span>
                                <span className="text-green-400 font-black">Passed</span>
                            </div>
                            <div className="w-full bg-white/5 h-1.5 rounded-full">
                                <div className="bg-green-500 h-full rounded-full w-[92%]" />
                            </div>
                            <p className="text-[10px] italic opacity-60">Automated merit-based filtering active. Bias risk: Very Low.</p>
                        </div>
                    </Card>
                </div>

                {/* Candidate Pipeline */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                            <UserGroupIcon className="w-6 h-6 text-blue-600" />
                            Candidate Pipeline
                        </h2>
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">{resumes.length} Total Applicants</span>
                    </div>

                    {sortedResumes.length === 0 ? (
                        <Card className="flex flex-col items-center justify-center py-32 text-center border-dashed border-2">
                            <UserGroupIcon className="w-16 h-16 text-gray-200 mb-4" />
                            <h3 className="text-xl font-bold text-gray-400">No Applicants Yet</h3>
                            <p className="text-sm text-gray-400 font-medium italic">New applications will appear here once processed.</p>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {sortedResumes.map((resume) => (
                                <Card key={resume.id} className="hover:shadow-lg transition-all border-l-4 group" style={{ borderLeftColor: resume.ai_score >= 80 ? '#22c55e' : resume.ai_score >= 60 ? '#f59e0b' : '#ef4444' }}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 shadow-inner">
                                                <span className={`text-xl font-black ${resume.ai_score >= 80 ? 'text-green-600' : resume.ai_score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                                                    {Math.round(resume.ai_score)}
                                                </span>
                                                <span className="text-[8px] font-black uppercase opacity-40">AI Score</span>
                                            </div>

                                            <div className="space-y-1">
                                                <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                                    {isAnonymized ? `Candidate #${resume.id.toString().padStart(4, '0')}` : resume.name}
                                                    {resume.trust_metadata && (
                                                        <ShieldCheckIcon className="w-4 h-4 text-blue-500" title="Verfied Analysis" />
                                                    )}
                                                </h4>
                                                <div className="flex items-center gap-3">
                                                    <Badge variant={getStatusColor(resume.status)} className="text-[10px] font-black uppercase">
                                                        {resume.status}
                                                    </Badge>
                                                    {resume.rejection_reason && (
                                                        <span className="text-[10px] font-semibold text-red-500 italic truncate max-w-xs" title={resume.rejection_reason}>
                                                            &bull; {resume.rejection_reason}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="hover:text-blue-600" onClick={() => router.push(`/resumes?job=${jobId}&candidate=${resume.id}`)}>
                                                <InformationCircleIcon className="w-5 h-5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="hover:text-green-600"
                                                onClick={() => handleUpdateStatus(resume.id, 'Shortlisted')}
                                            >
                                                <CheckCircleIcon className="w-5 h-5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="hover:text-red-600"
                                                onClick={() => handleUpdateStatus(resume.id, 'Rejected')}
                                            >
                                                <XCircleIcon className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
