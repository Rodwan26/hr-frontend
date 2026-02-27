'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { adminService } from '@/services/adminService';
import {
    RectangleGroupIcon,
    MapIcon,
    PlusIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const data = await adminService.getDepartments();
            setDepartments(data);
        } catch (err) {
            setError('Failed to load departments');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Organizational Structure</h1>
                    <p className="text-gray-500 font-medium italic">Manage departments, hierarchies, and team distributions.</p>
                </div>
                <Button variant="primary" className="shadow-lg">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Department
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1 bg-indigo-600 text-white border-none shadow-xl relative overflow-hidden" title="Global Hierarchy">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl" />
                    <div className="space-y-4">
                        <p className="text-xs font-bold leading-relaxed opacity-80">"Your organization currently has 12 departments spread across 3 global regions."</p>
                        <Button variant="ghost" className="w-full bg-white text-indigo-600 font-black text-xs uppercase tracking-widest shadow-lg">View Visual Tree</Button>
                    </div>
                </Card>

                <Card className="lg:col-span-2" title="Department Directory" subtitle="Active business units and their leadership.">
                    {loading ? (
                        <div className="flex justify-center py-20"><Spinner /></div>
                    ) : departments.length === 0 ? (
                        <div className="text-center py-20 grayscale opacity-40 font-bold uppercase tracking-widest text-xs italic">No departments configured</div>
                    ) : (
                        <Table>
                            <THead>
                                <TR>
                                    <TH>Department Name</TH>
                                    <TH>Head of Dept.</TH>
                                    <TH>Employees</TH>
                                    <TH className="text-right">Action</TH>
                                </TR>
                            </THead>
                            <TBody>
                                {departments.map((dept) => (
                                    <TR key={dept.id}>
                                        <TD className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                                <RectangleGroupIcon className="w-5 h-5" />
                                            </div>
                                            <span className="font-bold text-gray-900 uppercase tracking-tight">{dept.name}</span>
                                        </TD>
                                        <TD className="text-gray-500 italic font-medium">Michael Ross</TD>
                                        <TD><Badge variant="info">42 Members</Badge></TD>
                                        <TD className="text-right">
                                            <Button variant="ghost" size="icon">
                                                <ChevronRightIcon className="w-5 h-5 text-gray-300" />
                                            </Button>
                                        </TD>
                                    </TR>
                                ))}
                            </TBody>
                        </Table>
                    )}
                </Card>
            </div>
        </div>
    );
}
