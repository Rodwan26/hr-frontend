'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { payrollService } from '@/services/payrollService';
import {
    BanknotesIcon,
    ArrowPathIcon,
    CalculatorIcon,
    CheckBadgeIcon,
    ShieldCheckIcon,
    UsersIcon,
    ExclamationTriangleIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';

export default function PayrollPage() {
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [validating, setValidating] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            const data = await payrollService.getSummary();
            setSummary(data);
        } catch (err) {
            console.error('Failed to fetch payroll summary', err);
        } finally {
            setLoading(false);
        }
    };

    const handleValidate = async () => {
        setValidating(true);
        setSuccess(null);
        try {
            await payrollService.validate({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
            setSuccess('Payroll validated successfully for current period.');
            fetchSummary();
        } catch (err) {
            setError('Validation failed. Please check attendance records.');
        } finally {
            setValidating(false);
        }
    };

    const handleCalculate = async () => {
        setCalculating(true);
        setSuccess(null);
        try {
            await payrollService.calculateBulk({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
            setSuccess('Payroll calculation triggered for all employees.');
            fetchSummary();
        } catch (err) {
            setError('Calculation failed.');
        } finally {
            setCalculating(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

    const stats = [
        { name: 'Total Monthly Budget', value: `$${summary.total_budget.toLocaleString()}`, icon: BanknotesIcon, status: 'primary' },
        { name: 'Active Employees', value: summary.active_employees.toString(), icon: UsersIcon, status: 'neutral' },
        { name: 'Pending Exceptions', value: summary.exceptions_count.toString(), icon: ExclamationTriangleIcon, status: summary.exceptions_count > 0 ? 'warning' : 'success' },
        { name: 'Compliance Status', value: 'Compliant', icon: ShieldCheckIcon, status: 'success' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Payroll Engine</h1>
                    <p className="text-gray-500 font-medium italic">Automated validation, calculation, and distribution of salaries.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={handleValidate} loading={validating}>
                        <CheckBadgeIcon className="w-5 h-5 mr-2" />
                        Validate Period
                    </Button>
                    <Button variant="primary" onClick={handleCalculate} loading={calculating} className="shadow-lg shadow-blue-500/20">
                        <CalculatorIcon className="w-5 h-5 mr-2" />
                        Calculate All
                    </Button>
                </div>
            </div>

            {success && <Alert variant="success" title="Success" onClose={() => setSuccess(null)}>{success}</Alert>}
            {error && <Alert variant="error" title="Error" onClose={() => setError(null)}>{error}</Alert>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.name} className={`flex flex-col items-center justify-center py-10 gap-2 ${stat.status === 'primary' ? 'bg-blue-600 text-white border-none shadow-xl' : ''}`}>
                        <stat.icon className={`w-10 h-10 mb-2 ${stat.status === 'primary' ? 'opacity-80' : 'text-gray-400'}`} />
                        <p className={`text-4xl font-black tracking-tighter ${stat.status === 'primary' ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${stat.status === 'primary' ? 'opacity-60' : 'text-gray-400'}`}>{stat.name}</p>
                    </Card>
                ))}
            </div>

            <Card title="Recent Payroll Cycles" subtitle="History of generated payslips and period locks.">
                <Table>
                    <THead>
                        <TR>
                            <TH>Period</TH>
                            <TH>Status</TH>
                            <TH>Total Amount</TH>
                            <TH className="text-right">Action</TH>
                        </TR>
                    </THead>
                    <TBody>
                        {summary.recent_payrolls.map((payroll: any) => (
                            <TR key={payroll.id}>
                                <TD className="font-bold">Month {payroll.month}, {payroll.year}</TD>
                                <TD><Badge variant={payroll.status === 'paid' ? 'success' : 'warning'}>{payroll.status}</Badge></TD>
                                <TD className="font-bold">${payroll.net_salary.toLocaleString()}</TD>
                                <TD className="text-right">
                                    <Button variant="ghost" size="sm" className="font-bold text-xs uppercase tracking-widest text-blue-600">View Details</Button>
                                </TD>
                            </TR>
                        ))}
                        {summary.recent_payrolls.length === 0 && (
                            <TR>
                                <TD colSpan={4} className="text-center py-10 text-gray-400 italic">No payroll history found.</TD>
                            </TR>
                        )}
                    </TBody>
                </Table>
            </Card>
        </div>
    );
}
