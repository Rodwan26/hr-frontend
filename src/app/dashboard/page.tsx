'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
    UsersIcon,
    CalendarIcon,
    ChatBubbleLeftRightIcon,
    ArrowTrendingUpIcon,
    CheckCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { adminService } from '@/services/adminService';
import { Spinner } from '@/components/ui/Spinner';

export default function DashboardPage() {
    const [stats, setStats] = React.useState<any[]>([]);
    const [activities, setActivities] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [wellbeingScore, setWellbeingScore] = React.useState(8.4);

    React.useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [summary, logs] = await Promise.all([
                adminService.getSummary(),
                adminService.getAuditLogs({ limit: 4 })
            ]);

            // Map icons back to stats
            const iconMap: any = {
                "Total Employees": UsersIcon,
                "Active Requests": CalendarIcon,
                "AI Tickets Resolved": ChatBubbleLeftRightIcon,
                "Onboarding Progress": ArrowTrendingUpIcon
            };

            const enrichedStats = summary.stats.map((s: any) => ({
                ...s,
                icon: iconMap[s.name] || UsersIcon
            }));

            setStats(enrichedStats);
            setActivities(logs);
            setWellbeingScore(summary.wellbeing_score);
        } catch (err) {
            console.error('Failed to load dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-20"><Spinner /></div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Executive Dashboard</h1>
                <p className="text-gray-500 font-medium italic">High-level overview of your organization's HR performance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.name} className="hover:shadow-lg transition-all hover:-translate-y-1">
                        <div className="flex items-start justify-between">
                            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <Badge variant={stat.changeType === 'increase' ? 'success' : 'warning'}>
                                {stat.change}
                            </Badge>
                        </div>
                        <div className="mt-4 space-y-1">
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{stat.name}</p>
                            <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2" title="Company Wellbeing Trends" subtitle="AI-powered analysis of employee burnout risk and engagement.">
                    <div className="h-80 flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                        <div className="text-4xl font-black text-indigo-600 mb-2">{wellbeingScore}</div>
                        <p className="text-gray-400 font-bold tracking-widest uppercase text-xs">AITrust Safety Index: Healthy</p>
                    </div>
                </Card>

                <Card title="Recent HR Activity" subtitle="Real-time updates across all modules.">
                    <div className="space-y-6">
                        {activities.map((log, i) => (
                            <div key={log.id} className="flex gap-4 group">
                                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${i % 2 === 0 ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {log.ai_recommended ? <CheckCircleIcon className="w-5 h-5" /> : <ClockIcon className="w-5 h-5" />}
                                </div>
                                <div className="flex flex-col gap-1 border-b border-gray-100 pb-4 w-full">
                                    <p className="text-sm font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                                        {log.action.replace(/_/g, ' ')}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-medium">
                                        {log.entity_type} {log.entity_id && `#${log.entity_id}`}
                                    </p>
                                    <p className="text-xs font-semibold text-gray-400 italic">
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="ghost" className="w-full mt-4 text-gray-400 font-bold text-xs uppercase tracking-widest">
                        View All Audit Logs
                    </Button>
                </Card>
            </div>
        </div>
    );
}
