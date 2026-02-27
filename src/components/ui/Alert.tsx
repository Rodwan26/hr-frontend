import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    onClose?: () => void;
}

export const Alert = ({ className, variant = 'info', title, children, onClose, ...props }: AlertProps) => {
    const variants = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    return (
        <div
            className={cn(
                'p-4 rounded-lg border flex flex-col gap-1',
                variants[variant],
                className
            )}
            {...props}
        >
            <div className="flex-1 flex flex-col gap-1">
                {title && <span className="font-bold text-sm tracking-tight">{title}</span>}
                <div className="text-sm font-medium leading-relaxed opacity-90">{children}</div>
            </div>
            {onClose && (
                <button onClick={onClose} className="p-1 hover:bg-black/5 rounded">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
};
