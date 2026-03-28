"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "./sidebar-context";
import { useAuthStore } from "@/store/authStore";
import {
    LayoutDashboard,
    Users,
    Calendar,
    FileText,
    Menu,
    Moon,
    Sun,
    Settings,
    HelpCircle,
    LogOut,
    ShieldCheckIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function Sidebar() {
    const { collapsed, setCollapsed } = useSidebar();
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuthStore();

    const toggleTheme = () => {
        document.documentElement.classList.toggle("dark");
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const navItem = (href: string, label: string, Icon: any) => {
        const active = pathname === href;

        return (
            <Link
                href={href}
                className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group",
                    active
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
            >
                <Icon size={20} className={cn(active ? "text-white" : "group-hover:text-white")} />
                {!collapsed && <span className="font-medium">{label}</span>}
            </Link>
        );
    };

    return (
        <motion.div
            initial={false}
            animate={{ width: collapsed ? 80 : 260 }}
            className="h-screen bg-sidebar text-white fixed right-0 top-0 shadow-2xl flex flex-col z-50 transition-all duration-300 ease-in-out border-l border-gray-800"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800 h-20">
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-2"
                    >
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-lg">H</div>
                        <h1 className="font-bold text-xl tracking-tight">HR AI</h1>
                    </motion.div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <Menu size={20} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 p-4 flex-1 overflow-y-auto custom-scrollbar">
                {navItem("/dashboard", "Dashboard", LayoutDashboard)}
                {navItem("/recruitment", "Recruitment", Users)}
                {navItem("/leave", "Leave", Calendar)}
                {navItem("/documents", "Documents", FileText)}
                {navItem("/profile", "Profile", Users)}

                <div className="my-4 border-t border-gray-800 pt-4">
                    {navItem("/settings", "Settings", Settings)}
                    {user?.role === 'SUPER_ADMIN' && navItem("/system-admin", "System Admin", ShieldCheckIcon)}
                    {navItem("/help", "Help", HelpCircle)}
                </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 space-y-4">
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-4 w-full hover:bg-gray-800 p-2 rounded-xl transition-colors text-gray-400 hover:text-white"
                >
                    <Moon size={20} />
                    {!collapsed && <span className="text-sm font-medium">Dark Mode</span>}
                </button>

                {!collapsed ? (
                    <div className="bg-gray-800/50 p-3 rounded-2xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-sm font-bold">
                            {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-semibold truncate">{user?.full_name || user?.email?.split('@')[0] || 'User'}</p>
                            <p className="text-xs text-gray-500 truncate capitalize">{user?.role?.replace('_', ' ') || 'User'}</p>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                            title="Logout"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <button 
                            onClick={handleLogout}
                            className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-sm font-bold hover:bg-red-500 transition-colors"
                            title="Logout"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
