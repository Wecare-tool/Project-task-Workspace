import { clsx, type ClassValue } from 'clsx';

/**
 * Merges class names with clsx
 */
export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

/**
 * Generates a unique ID
 */
export function generateId(): string {
    return crypto.randomUUID();
}

/**
 * Formats a date to a localized string
 */
export function formatDate(date: Date | string | undefined, options?: Intl.DateTimeFormatOptions): string {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('vi-VN', options ?? {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}

/**
 * Formats a datetime to a localized string
 */
export function formatDateTime(date: Date | string | undefined): string {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Formats relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) {
        return formatDate(d);
    } else if (diffDays > 0) {
        return `${diffDays} ngày trước`;
    } else if (diffHours > 0) {
        return `${diffHours} giờ trước`;
    } else if (diffMins > 0) {
        return `${diffMins} phút trước`;
    } else {
        return 'Vừa xong';
    }
}

/**
 * Truncates a string to a specified length
 */
export function truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Debounces a function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Deep clones an object
 */
export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Checks if an object is empty
 */
export function isEmpty(obj: object): boolean {
    return Object.keys(obj).length === 0;
}

/**
 * Groups an array by a key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((result, item) => {
        const groupKey = String(item[key]);
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {} as Record<string, T[]>);
}

/**
 * Converts a string to slug format
 */
export function slugify(str: string): string {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Parses a date string to Date object safely
 */
export function parseDate(dateStr: string | Date | undefined): Date | undefined {
    if (!dateStr) return undefined;
    if (dateStr instanceof Date) return dateStr;
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? undefined : parsed;
}

/**
 * Gets status color class based on status
 */
export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        'not-started': 'badge-neutral',
        'in-progress': 'badge-info',
        'blocked': 'badge-danger',
        'completed': 'badge-success',
        'active': 'badge-success',
        'archived': 'badge-neutral',
        'on-hold': 'badge-warning',
        'pending': 'badge-warning',
        'failed': 'badge-danger',
        'skipped': 'badge-neutral',
    };
    return colors[status] || 'badge-neutral';
}

/**
 * Gets status label in Vietnamese
 */
export function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        'not-started': 'Chưa bắt đầu',
        'in-progress': 'Đang thực hiện',
        'blocked': 'Bị chặn',
        'completed': 'Hoàn thành',
        'active': 'Đang hoạt động',
        'archived': 'Đã lưu trữ',
        'on-hold': 'Tạm dừng',
        'pending': 'Chờ xử lý',
        'failed': 'Thất bại',
        'skipped': 'Bỏ qua',
    };
    return labels[status] || status;
}

/**
 * Gets priority color class
 */
export function getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
        'low': 'badge-neutral',
        'medium': 'badge-info',
        'high': 'badge-warning',
        'critical': 'badge-danger',
    };
    return colors[priority] || 'badge-neutral';
}

/**
 * Gets priority label in Vietnamese
 */
export function getPriorityLabel(priority: string): string {
    const labels: Record<string, string> = {
        'low': 'Thấp',
        'medium': 'Trung bình',
        'high': 'Cao',
        'critical': 'Khẩn cấp',
    };
    return labels[priority] || priority;
}
