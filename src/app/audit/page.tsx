'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { adminService } from '@/services/adminService';
import {
    ShieldCheckIcon,
    ClockIcon,
    UserCircleIcon,
    TagIcon
} from '@heroicons/react/24/outline';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const data = await adminService.getAuditLogs();
            setLogs(data);
        } catch (err) {
            setError('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Security Audit Logs</h1>
                <p className="text-gray-500 font-medium italic">Immutable record of all sensitive actions and system mutations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="flex flex-col gap-1 bg-slate-900 text-white border-none shadow-xl">
                    <ShieldCheckIcon className="w-6 h-6 text-green-400 mb-1" />
                    <p className="text-xl font-black">{logs.length.toLocaleString()}</p>
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Actions Tracked (Current View)</p>
                </Card>
                <Card className="flex flex-col gap-1 hover:shadow-md transition-shadow">
                    <TagIcon className="w-6 h-6 text-blue-600 mb-1" />
                    <p className="text-xl font-black">100%</p>
                    <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Security Coverage</p>
                </Card>
            </div>

            <Card title="System Activity Stream" subtitle="Full transparency of user and AI operations.">
                {loading ? (
                    <div className="flex justify-center py-20"><Spinner /></div>
                ) : error ? (
                    <Alert variant="error" title="Error">{error}</Alert>
                ) : logs.length === 0 ? (
                    <div className="text-center py-20 grayscale opacity-40 font-bold uppercase tracking-widest text-xs">No logs found</div>
                ) : (
                    <Table>
                        <THead>
                            <TR>
                                <TH>Timestamp</TH>
                                <TH>User</TH>
                                <TH>Action</TH>
                                <TH>Entity</TH>
                                <TH className="text-right">Status</TH>
                            </TR>
                        </THead>
                        <TBody>
                            {logs.map((log) => (
                                <TR key={log.id}>
                                    <TD className="text-xs font-medium text-gray-500 flex items-center gap-2">
                                        <ClockIcon className="w-3.5 h-3.5" />
                                        {new Date(log.timestamp).toLocaleString()}
                                    </TD>
                                    <TD className="flex items-center gap-2 font-bold text-gray-900 text-sm">
                                        <UserCircleIcon className="w-5 h-5 text-gray-400" />
                                        {log.user_role === 'ADMIN' ? 'System Admin' : log.user_id ? `User #${log.user_id}` : 'System'}
                                    </TD>
                                    <TD className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                                        <Badge variant={log.ai_recommended ? 'info' : 'default'} className="mr-2">
                                            {log.action.replace(/_/g, ' ')}
                                        </Badge>
                                    </TD>
                                    <TD className="text-gray-500 text-xs">
                                        <span className="font-bold text-gray-900 lowercase italic">{log.entity_type}</span>
                                        {log.entity_id && ` [ID: ${log.entity_id}]`}
                                    </TD>
                                    <TD className="text-right"><Badge variant="success">Success</Badge></TD>
                                </TR>
                            ))}
                        </TBody>
                    </Table>
                )}
            </Card>
        </div>
    );
}
