import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@utils/index';
import type { SelectOption } from '@/types';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    helperText?: string;
    options: SelectOption[];
    placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            className,
            label,
            error,
            helperText,
            options,
            placeholder,
            id,
            ...props
        },
        ref
    ) => {
        const selectId = id || props.name;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-sm font-medium text-dark-700 mb-1.5"
                    >
                        {label}
                        {props.required && <span className="text-danger-500 ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        className={cn(
                            error ? 'input-error' : 'input',
                            'appearance-none pr-10 cursor-pointer',
                            className
                        )}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 pointer-events-none">
                        <ChevronDown className="h-4 w-4" />
                    </div>
                </div>
                {error && (
                    <p className="mt-1.5 text-sm text-danger-600">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-dark-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';
