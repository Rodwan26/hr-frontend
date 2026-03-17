import { useState, useEffect, useRef } from "react";
import { Bell, Search, User, CheckCircle2, Info, AlertTriangle, AlertCircle, X, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { notificationService, Notification } from "@/services/notificationService";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { useAuthStore } from "@/store/authStore";

export default function Navbar() {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchNotifications();
        // Poll for notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    const handleMarkAsRead = async (id: number, link?: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
            if (link) {
                setIsOpen(false);
                router.push(link);
            }
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle2 size={16} className="text-green-500" />;
            case 'warning': return <AlertTriangle size={16} className="text-amber-500" />;
            case 'error': return <AlertCircle size={16} className="text-red-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    return (
        <div className="w-full bg-white dark:bg-card/50 backdrop-blur-md shadow-sm border border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center rounded-2xl sticky top-0 z-40 transition-all duration-200">
            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 w-full max-w-md">
                <Search size={18} className="text-gray-400" />
                <input
                    type="text"
                    placeholder="ابحث هنا..."
                    className="bg-transparent border-none outline-none text-sm w-full dark:text-gray-200"
                />
            </div>

            <div className="flex items-center gap-4">
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors border border-gray-200 dark:border-gray-800 relative group"
                    >
                        <Bell size={20} className="text-gray-600 dark:text-gray-400 group-hover:text-primary transition-colors" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900 animate-pulse">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute left-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
                                style={{ transformOrigin: "top left" }}
                            >
                                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                                    <h3 className="font-bold text-sm dark:text-gray-200">التنبيهات</h3>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={handleMarkAllRead}
                                            className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest"
                                        >
                                            تحديد الكل كمقروء
                                        </button>
                                    )}
                                </div>

                                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center flex flex-col items-center gap-2">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                                <Bell size={20} className="text-gray-400" />
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium">لا توجد تنبيهات جديدة</p>
                                        </div>
                                    ) : (
                                        notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                onClick={() => handleMarkAsRead(notification.id, notification.link)}
                                                className={`p-4 border-b border-gray-50 dark:border-gray-800/50 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex gap-3 items-start relative ${!notification.is_read ? 'bg-primary/5' : ''}`}
                                            >
                                                <div className="mt-1">
                                                    {getIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 flex flex-col gap-0.5">
                                                    <p className={`text-xs font-bold dark:text-gray-200 ${!notification.is_read ? 'text-gray-900' : 'text-gray-500'}`}>
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 font-medium mt-1">
                                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: ar })}
                                                    </p>
                                                </div>
                                                {!notification.is_read && (
                                                    <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 text-center">
                                    <button className="text-[11px] font-bold text-gray-500 hover:text-primary transition-colors">
                                        عرض كل التنبيهات
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="h-10 w-px bg-gray-200 dark:bg-gray-800 mx-2"></div>

                <div className="h-10 w-px bg-gray-200 dark:bg-gray-800 mx-2"></div>

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                    <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center gap-3 p-1 pl-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-colors cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <User size={18} className="text-primary" />
                        </div>
                        <span className="text-sm font-semibold hidden md:block dark:text-gray-200">
                            {user?.full_name || user?.email?.split('@')[0] || 'User'}
                        </span>
                    </button>

                    <AnimatePresence>
                        {userMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden z-50"
                                style={{ transformOrigin: "top left" }}
                            >
                                <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                                    <p className="text-sm font-bold dark:text-gray-200 truncate">{user?.full_name || 'User'}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                    <p className="text-xs text-primary font-medium mt-1 capitalize">{user?.role?.replace('_', ' ')}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full p-3 flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium text-left"
                                >
                                    <LogOut size={16} />
                                    تسجيل الخروج
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1e293b;
                }
            `}</style>
        </div>
    );
}
