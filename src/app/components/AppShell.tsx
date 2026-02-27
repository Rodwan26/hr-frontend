'use client'

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from './Sidebar';

// Import needed for mobile menu icon
import { Bars3Icon } from '@heroicons/react/24/outline';

export function AppShell({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuthStore();
    const pathname = usePathname();
    const [isHydrated, setIsHydrated] = React.useState(false);
    const [sidebarOpen, setSidebarOpen] = React.useState(false); // Mobile sidebar state

    // Hydration guard to prevent Sidebar disappearing on page load/refresh
    React.useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Pages that don't need the full AppShell (no sidebar)
    const isAuthPage = pathname === '/login' || pathname === '/setup';

    if (isAuthPage) {
        return (
            <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
                {children}
            </div>
        );
    }

    // While hydration is happening, we show the layout without the conditional sidebar
    // to avoid layout shifts. Once hydrated, we show the full shell.
    const showSidebar = isHydrated && isAuthenticated;

    return (
        <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
            {process.env.NEXT_PUBLIC_APP_ENV === 'staging' && (
                <div className="bg-amber-500 text-white text-[10px] uppercase font-bold text-center py-1 tracking-widest fixed top-0 w-full z-[60]">
                    Staging Environment - v1.0.0
                </div>
            )}

            {/* Mobile Header - Visible only on mobile when authenticated */}
            {showSidebar && (
                <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 h-16 flex items-center justify-between shadow-sm">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 -ml-2 text-gray-600 hover:text-indigo-600 rounded-lg hover:bg-gray-100"
                    >
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <span className="font-bold text-lg text-gray-800">HR AI Platform</span>
                    <div className="w-8" /> {/* Spacer for centering */}
                </div>
            )}

            {/* Sidebar Navigation - Visible only if authenticated and fully hydrated */}
            {showSidebar && (
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <main className={`${showSidebar ? 'md:pl-72' : ''} transition-all duration-300 min-h-screen`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

