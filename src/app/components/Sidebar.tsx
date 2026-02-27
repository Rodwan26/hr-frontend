'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  HomeIcon,
  DocumentTextIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  DocumentDuplicateIcon,
  UserGroupIcon,
  CalendarIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon,
  BanknotesIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  RectangleGroupIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const isHR = user && (user.role === 'HR_ADMIN' || user.role === 'HR_STAFF');

  const categories = [
    {
      title: 'Main',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: pathname === '/dashboard' },
        { name: 'Help Desk', href: '/', icon: ChatBubbleLeftRightIcon, current: pathname === '/' },
      ]
    },
    ...(isHR ? [
      {
        title: 'Recruitment',
        items: [
          { name: 'Jobs', href: '/jobs', icon: DocumentTextIcon, current: pathname.startsWith('/jobs') },
          { name: 'Resumes', href: '/resumes', icon: UserGroupIcon, current: pathname.startsWith('/resumes') },
          { name: 'Interviews', href: '/interviews', icon: CalendarIcon, current: pathname.startsWith('/interviews') },
        ]
      }
    ] : []),
    {
      title: 'Operations',
      items: [
        { name: 'Leave', href: '/leave', icon: CalendarIcon, current: pathname.startsWith('/leave') },
        ...(isHR ? [{ name: 'Payroll', href: '/payroll', icon: BanknotesIcon, current: pathname.startsWith('/payroll') }] : []),
        { name: 'My Profile', href: '/profile', icon: UserIcon, current: pathname.startsWith('/profile') },
      ]
    },
    {
      title: 'Resources',
      items: [
        { name: 'Documents', href: '/documents', icon: DocumentDuplicateIcon, current: pathname.startsWith('/documents') },
        { name: 'Onboarding', href: '/onboarding', icon: UserGroupIcon, current: pathname.startsWith('/onboarding') },
      ]
    },
    ...(isHR ? [
      {
        title: 'Analytics',
        items: [
          { name: 'Wellbeing Trends', href: '/burnout', icon: ChartBarIcon, current: pathname.startsWith('/burnout') },
          { name: 'Burnout Risk', href: '/risk', icon: HeartIcon, current: pathname.startsWith('/risk') },
        ]
      },
      {
        title: 'System',
        items: [
          { name: 'Departments', href: '/departments', icon: RectangleGroupIcon, current: pathname.startsWith('/departments') },
          { name: 'Audit Logs', href: '/audit', icon: ShieldCheckIcon, current: pathname.startsWith('/audit') },
        ]
      }
    ] : []),
  ];

  // Overlay for mobile
  const MobileOverlay = () => (
    <div
      className={`fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
    />
  );

  return (
    <>
      <MobileOverlay />
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white shadow-xl border-r border-slate-800 transform transition-transform duration-300 ease-in-out md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-20 border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm px-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:bg-indigo-50 transition-colors">
              <span className="text-xl font-bold text-white">HR</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent transition-all">AI Platform</h1>
          </Link>
          {/* Mobile Close Button */}
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto pt-6 pb-4 px-4 space-y-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {categories.map((category) => (
            <div key={category.title} className="space-y-2">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 px-2 opacity-80">{category.title}</div>
              <div className="space-y-1">
                {category.items.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => onClose && onClose()} // Close sidebar on mobile nav
                    className={`
                      group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out
                      ${item.current
                        ? 'bg-indigo-600/10 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.15)] border border-indigo-500/20'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white hover:translate-x-1'
                      }
                    `}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200 ${item.current ? 'text-indigo-400' : 'text-slate-500 group-hover:text-white'}`}
                      aria-hidden="true"
                    />
                    {item.name}
                    {item.current && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          {user ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold shadow-md">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">{user.email}</p>
                  <p className="text-xs text-slate-400 truncate capitalize font-semibold tracking-wide italic opacity-70 border-t border-white/5 mt-0.5 pt-0.5">{user.role?.replace('_', ' ').toLowerCase()}</p>
                </div>
              </div>

              <button
                onClick={() => logout()}
                className="w-full flex items-center justify-center gap-2 mt-2 px-4 py-2 border border-red-900/10 bg-red-500/5 rounded-lg text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-red-900/20 hover:border-red-800/40 transition-all focus:outline-none"
              >
                <ArrowLeftOnRectangleIcon className="w-4 h-4" />
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
