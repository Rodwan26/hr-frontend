'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/store/authStore';
import {
    UserIcon,
    LockClosedIcon,
    BellIcon,
    GlobeAltIcon,
    ShieldCheckIcon,
    SwatchIcon,
    MoonIcon,
    SunIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

const settingsSections = [
    { id: 'account', name: 'الحساب الشخصي', icon: UserIcon },
    { id: 'security', name: 'الأمان والخصوصية', icon: LockClosedIcon },
    { id: 'notifications', name: 'التنبيهات', icon: BellIcon },
    { id: 'appearance', name: 'المظهر', icon: SwatchIcon },
];

export default function SettingsPage() {
    const { user, setAuth, logout } = useAuthStore();
    const router = useRouter();
    const [activeSection, setActiveSection] = useState('account');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [resetLoading, setResetLoading] = useState(false);

    // Check if user is admin
    const isAdmin = user?.role === 'HR_ADMIN' || user?.role === 'HR_MANAGER' || user?.role === 'SUPER_ADMIN';

    // Add system section for admins
    const allSections = isAdmin 
        ? [...settingsSections, { id: 'system', name: 'إعدادات النظام', icon: ExclamationTriangleIcon }]
        : settingsSections;

    // Password State
    const [email, setEmail] = useState(user?.email || '');
    const [displayName, setDisplayName] = useState(user?.full_name || user?.email.split('@')[0] || '');

    // Password State
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    useEffect(() => {
        if (user) {
            setEmail(user.email);
            setDisplayName(user.full_name || user.email.split('@')[0]);
        }
    }, [user]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const updatedUser = await userService.updateProfile({
                email,
                full_name: displayName
            });
            // Update local store with new user data
            setAuth(updatedUser, useAuthStore.getState().token ?? '', useAuthStore.getState().refreshToken ?? '');
            setMessage({ type: 'success', text: 'تم تحديث الملف الشخصي بنجاح' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.detail || 'فشل تحديث الملف الشخصي' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setMessage({ type: 'error', text: 'كلمات المرور الجديدة غير متطابقة' });
            return;
        }

        setLoading(true);
        setMessage(null);
        try {
            await userService.changePassword({
                current_password: passwords.current,
                new_password: passwords.new
            });
            setMessage({ type: 'success', text: 'تم تغيير كلمة المرور بنجاح' });
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.errors?.[0]?.msg || 'فشل تغيير كلمة المرور' });
        } finally {
            setLoading(false);
        }
    };

    const handleResetOrganization = async () => {
        if (!confirm('⚠️ تحذير: هذا الإجراء سيحذف جميع بيانات الشركة نهائياً!\n\nهل أنت متأكد من المتابعة؟')) {
            return;
        }
        
        if (!confirm('⚠️最后一次确认：所有员工、部门、招聘、工资数据都将被永久删除！\n\n هل تريد المتابعة؟')) {
            return;
        }

        setResetLoading(true);
        try {
            await api.delete('/admin/reset/organization');
            alert('تم إعادة تعيين بيانات الشركة بنجاح');
            logout();
            router.push('/login?message=تم إعادة تعيين البيانات. يرجى تسجيل الدخول مرة أخرى');
        } catch (err: any) {
            alert(err.response?.data?.detail || 'فشل إعادة تعيين البيانات');
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">إعدادات النظام</h1>
                <p className="text-gray-500 font-medium italic">إدارة تفضيلات حسابك، الأمان، وتخصيص تجربة الاستخدام.</p>
            </div>

            {message && (
                <Alert variant={message.type === 'success' ? 'info' : 'error'} className="animate-in fade-in slide-in-from-top-2">
                    {message.text}
                </Alert>
            )}

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Navigation Sidebar */}
                <aside className="lg:w-64 space-y-2">
                    {allSections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => { setActiveSection(section.id); setMessage(null); }}
                            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 font-bold text-sm
                                ${activeSection === section.id
                                    ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                                    : 'text-gray-500 hover:bg-white hover:text-gray-900 shadow-sm border border-transparent hover:border-gray-100'}`}
                        >
                            <section.icon className={`w-5 h-5 ${activeSection === section.id ? 'text-white' : 'text-gray-400'}`} />
                            {section.name}
                        </button>
                    ))}
                </aside>

                {/* Content Area */}
                <main className="flex-1 space-y-6">
                    {activeSection === 'account' && (
                        <Card className="border-none shadow-2xl shadow-gray-200/50" title="تفاصيل الحساب" subtitle="تحديث معلوماتك الشخصية وطريقة ظهورك في النظام.">
                            <form onSubmit={handleSaveProfile} className="space-y-6 mt-6">
                                <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                                            {displayName.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-lg font-bold text-gray-900">{displayName}</p>
                                        <p className="text-sm text-gray-500">{user?.role?.replace('_', ' ') || 'User'}</p>
                                        <Badge variant="info">حساب موثق</Badge>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">الاسم الكامل</label>
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium text-gray-900"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">البريد الإلكتروني</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium text-gray-900"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <Button type="submit" variant="primary" loading={loading} className="px-8 py-4 rounded-2xl font-bold shadow-lg">حفظ التعديلات</Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    {activeSection === 'security' && (
                        <Card className="border-none shadow-2xl shadow-gray-200/50" title="الأمان" subtitle="تأمين حسابك عبر تغيير كلمة المرور وتفعيل المصادقة الثنائية.">
                            <form onSubmit={handleUpdatePassword} className="space-y-8 mt-6">
                                <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex items-start gap-4">
                                    <ShieldCheckIcon className="w-8 h-8 text-red-500 flex-shrink-0" />
                                    <div className="space-y-1">
                                        <p className="font-bold text-red-900">حماية الحساب</p>
                                        <p className="text-sm text-red-600 font-medium">نوصي بتحديث كلمة المرور بانتظام لضمان أمان حسابك.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">كلمة المرور الحالية</label>
                                        <input
                                            type="password"
                                            required
                                            value={passwords.current}
                                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary transition-all font-medium text-gray-900"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">كلمة المرور الجديدة</label>
                                        <input
                                            type="password"
                                            required
                                            value={passwords.new}
                                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary transition-all font-medium text-gray-900"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">تأكيد كلمة المرور الجديدة</label>
                                        <input
                                            type="password"
                                            required
                                            value={passwords.confirm}
                                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                            placeholder="••••••••"
                                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary transition-all font-medium text-gray-900"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <Button type="submit" variant="primary" loading={loading} className="px-8 py-4 rounded-2xl font-bold shadow-lg">تحديث كلمة المرور</Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    {activeSection === 'notifications' && (
                        <Card className="border-none shadow-2xl shadow-gray-200/50" title="تفضيلات التنبيهات" subtitle="اختر كيف ومتى تود استلام التنبيهات من النظام (قريبا).">
                            <div className="space-y-4 mt-6">
                                {[
                                    { name: 'تنبيهات البريد الإلكتروني', desc: 'استلام ملخصات يومية عن نشاط الموظفين.' },
                                    { name: 'تنبيهات الطلبات الجديدة', desc: 'إشعار فوري عند تقديم طلب إجازة أو مستند جديد.' },
                                    { name: 'تحديثات النظام', desc: 'إشعارات حول الميزات والتحسينات الجديدة.' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                                        <div className="space-y-1">
                                            <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">{item.name}</p>
                                            <p className="text-xs text-gray-500 font-medium">{item.desc}</p>
                                        </div>
                                        <div className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked className="sr-only peer" disabled />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary opacity-50"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {activeSection === 'appearance' && (
                        <Card className="border-none shadow-2xl shadow-gray-200/50" title="تخصيص المظهر" subtitle="اختر السمة التي تفضلها لاستخدام النظام (قريبا).">
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <button className="p-6 bg-white border-2 border-primary rounded-3xl space-y-4 shadow-xl shadow-primary/5 transition-all text-right">
                                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-primary">
                                        <SunIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">الوضع المضيء</p>
                                        <p className="text-xs text-gray-500 font-medium">الوضع الافتراضي للنظام</p>
                                    </div>
                                </button>
                                <button disabled className="p-6 bg-gray-900 border-2 border-transparent rounded-3xl space-y-4 hover:border-primary transition-all group text-right opacity-50 cursor-not-allowed">
                                    <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-primary">
                                        <MoonIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">الوضع الليلي</p>
                                        <p className="text-xs text-gray-500 font-medium">مريح للعين في الإضاءة الخافتة</p>
                                    </div>
                                </button>
                            </div>
                        </Card>
                    )}

                    {activeSection === 'system' && isAdmin && (
                        <Card className="border-none shadow-2xl shadow-gray-200/50" title="إعدادات النظام" subtitle="خيارات متقدمة للمسؤولين فقط.">
                            <div className="space-y-6 mt-6">
                                <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
                                    <div className="flex items-start gap-4">
                                        <ExclamationTriangleIcon className="w-8 h-8 text-red-500 flex-shrink-0" />
                                        <div className="space-y-2">
                                            <p className="font-bold text-red-900">خطر: إعادة تعيين بيانات الشركة</p>
                                            <p className="text-sm text-red-600 font-medium">
                                                هذا الإجراء سيحذف جميع بيانات الشركة نهائياً بما في ذلك:
                                            </p>
                                            <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
                                                <li>جميع الموظفين</li>
                                                <li>جميع الأقسام</li>
                                                <li>جميع الوظائف والسير الذاتية</li>
                                                <li>جميع طلبات الإجازات</li>
                                                <li>جميع بيانات الرواتب</li>
                                            </ul>
                                            <p className="text-sm text-red-600 font-medium pt-2">
                                                <strong>لا يمكن التراجع عن هذا الإجراء!</strong>
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 pt-4 border-t border-red-200">
                                        <Button 
                                            type="button"
                                            variant="danger"
                                            onClick={handleResetOrganization}
                                            loading={resetLoading}
                                            className="w-full"
                                        >
                                            {resetLoading ? 'جاري الحذف...' : 'حذف جميع بيانات الشركة'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </main>
            </div>
        </div>
    );
}
