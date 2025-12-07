import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@utils/index';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, label, error, id, ...props }, ref) => {
        const checkboxId = id || props.name;

        return (
            <div className="w-full">
                <label
                    htmlFor={checkboxId}
                    className={cn(
                        'flex items-center gap-3 cursor-pointer group',
                        props.disabled && 'cursor-not-allowed opacity-50'
                    )}
                >
                    <div className="relative">
                        <input
                            ref={ref}
                            type="checkbox"
                            id={checkboxId}
                            className={cn(
                                'peer sr-only',
                                className
                            )}
                            {...props}
                        />
                        <div
                            className={cn(
                                'w-5 h-5 rounded border-2 transition-all duration-200',
                                'flex items-center justify-center',
                                'border-dark-300 bg-white',
                                'peer-checked:border-primary-600 peer-checked:bg-primary-600',
                                'peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-2',
                                'group-hover:border-dark-400 peer-checked:group-hover:border-primary-700',
                                error && 'border-danger-500'
                            )}
                        >
                            <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                    </div>
                    {label && (
                        <span className="text-sm text-dark-700 select-none">
                            {label}
                        </span>
                    )}
                </label>
                {error && (
                    <p className="mt-1.5 text-sm text-danger-600">{error}</p>
                )}
            </div>
        );
    }
);

Checkbox.displayName = 'Checkbox';
