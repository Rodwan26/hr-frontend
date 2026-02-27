"use client";

import { useSidebar } from "./sidebar-context";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import React from "react";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { collapsed } = useSidebar();
    const pathname = usePathname();
    const { isAuthenticated } = useAuthStore();
    const [isHydrated, setIsHydrated] = React.useState(false);

    React.useEffect(() => {
        setIsHydrated(true);
    }, []);

    const isAuthPage = pathname === '/login' || pathname === '/setup';

    if (!isHydrated) return null;

    if (isAuthPage || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black">
                {children}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black flex">
            <Sidebar />
            <div
                className="flex-1 p-6 transition-all duration-300 ease-in-out"
                style={{ marginRight: collapsed ? '80px' : '260px' }}
            >
                <Navbar />
                <main className="mt-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
