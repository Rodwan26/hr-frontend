import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, ...props }, ref) => {
        return (
            <div className="w-full space-y-1.5 text-left">
                {label && (
                    <label className="text-sm font-medium text-gray-700 ml-1">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={cn(
                        'flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
                        error && 'border-red-500 focus:ring-red-500/10 focus:border-red-600',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-xs font-medium text-red-600 mt-1 ml-1">{error}</p>
                )}
                {!error && helperText && (
                    <p className="text-xs text-gray-500 mt-1 ml-1">{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
