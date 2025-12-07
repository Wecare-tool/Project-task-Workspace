import { cn } from '@utils/index';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle,
    AlertTriangle
} from 'lucide-react';
import type { TaskStatus, TaskPriority } from '@/types';

// Status Badge
interface StatusBadgeProps {
    status: TaskStatus | string;
    size?: 'sm' | 'md';
    showIcon?: boolean;
}

const statusConfig: Record<TaskStatus | string, {
    label: string;
    className: string;
    icon: React.ReactNode
}> = {
    'not-started': {
        label: 'Not Started',
        className: 'badge-neutral',
        icon: <Clock className="w-3 h-3" />,
    },
    'in-progress': {
        label: 'In Progress',
        className: 'badge-info',
        icon: <AlertCircle className="w-3 h-3" />,
    },
    'blocked': {
        label: 'Blocked',
        className: 'badge-danger',
        icon: <XCircle className="w-3 h-3" />,
    },
    'completed': {
        label: 'Completed',
        className: 'badge-success',
        icon: <CheckCircle className="w-3 h-3" />,
    },
    'active': {
        label: 'Active',
        className: 'badge-success',
        icon: <CheckCircle className="w-3 h-3" />,
    },
    'archived': {
        label: 'Archived',
        className: 'badge-neutral',
        icon: <Clock className="w-3 h-3" />,
    },
    'on-hold': {
        label: 'On Hold',
        className: 'badge-warning',
        icon: <AlertTriangle className="w-3 h-3" />,
    },
    'pending': {
        label: 'Pending',
        className: 'badge-warning',
        icon: <Clock className="w-3 h-3" />,
    },
    'failed': {
        label: 'Failed',
        className: 'badge-danger',
        icon: <XCircle className="w-3 h-3" />,
    },
    'skipped': {
        label: 'Skipped',
        className: 'badge-neutral',
        icon: <Clock className="w-3 h-3" />,
    },
};

export function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
    const config = statusConfig[status] || {
        label: status,
        className: 'badge-neutral',
        icon: <Clock className="w-3 h-3" />,
    };

    return (
        <span
            className={cn(
                config.className,
                size === 'sm' && 'text-xs px-2 py-0.5'
            )}
        >
            {showIcon && config.icon}
            {config.label}
        </span>
    );
}

// Priority Badge
interface PriorityBadgeProps {
    priority: TaskPriority | string;
    size?: 'sm' | 'md';
    showIcon?: boolean;
}

const priorityConfig: Record<TaskPriority | string, {
    label: string;
    className: string;
}> = {
    'low': {
        label: 'Low',
        className: 'badge-neutral',
    },
    'medium': {
        label: 'Medium',
        className: 'badge-info',
    },
    'high': {
        label: 'High',
        className: 'badge-warning',
    },
    'critical': {
        label: 'Critical',
        className: 'badge-danger',
    },
};

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
    const config = priorityConfig[priority] || {
        label: priority,
        className: 'badge-neutral',
    };

    return (
        <span
            className={cn(
                config.className,
                size === 'sm' && 'text-xs px-2 py-0.5'
            )}
        >
            {config.label}
        </span>
    );
}
