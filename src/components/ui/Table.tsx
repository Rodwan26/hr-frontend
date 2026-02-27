import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> { }

export const Table = ({ className, ...props }: TableProps) => (
    <div className="w-full overflow-auto rounded-xl border border-gray-200">
        <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
);

export const THead = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className={cn('bg-gray-50 border-b border-gray-200', className)} {...props} />
);

export const TBody = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
);

export const TR = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr
        className={cn(
            'border-b border-gray-100 transition-colors hover:bg-gray-50/50 data-[state=selected]:bg-gray-100',
            className
        )}
        {...props}
    />
);

export const TH = ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th
        className={cn(
            'h-12 px-4 text-left align-middle font-bold text-gray-900 [&:has([role=checkbox])]:pr-0',
            className
        )}
        {...props}
    />
);

export const TD = ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <th
        className={cn('p-4 align-middle font-medium text-gray-700 [&:has([role=checkbox])]:pr-0', className)}
        {...props}
    />
);
