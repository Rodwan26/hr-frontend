'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface FormFieldProps {
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
    options?: { label: string; value: string | number }[];
    helperText?: string;
    error?: string | null;
}

export const FormField = ({ name, label, type = 'text', placeholder, options, helperText, error: externalError }: FormFieldProps) => {
    const { control } = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error: formError } }) => {
                const displayError = externalError || formError?.message;
                
                if (type === 'select' && options) {
                    return (
                        <Select
                            {...field}
                            label={label}
                            options={options}
                            error={displayError}
                        />
                    );
                }

                return (
                    <Input
                        {...field}
                        type={type}
                        label={label}
                        placeholder={placeholder}
                        error={displayError}
                        helperText={helperText}
                    />
                );
            }}
        />
    );
};
