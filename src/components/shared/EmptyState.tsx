import type { ReactNode } from 'react';
import { Button } from '@components/ui';
import { cn } from '@utils/index';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
        icon?: ReactNode;
    };
    className?: string;
}

export function EmptyState({
    icon,
    title,
    description,
    action,
    className
}: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
            {icon && (
                <div className="text-6xl mb-4 text-neutral-300">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                {title}
            </h3>
            {description && (
                <p className="text-sm text-neutral-500 mb-6 max-w-md">
                    {description}
                </p>
            )}
            {action && (
                <Button onClick={action.onClick} variant="primary" leftIcon={action.icon}>
                    {action.label}
                </Button>
            )}
        </div>
    );
}
