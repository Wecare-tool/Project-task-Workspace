import type { Toast } from '@/types';
import { useAppStore } from '@stores/index';
import { cn } from '@utils/index';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const toastIcons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
};

const toastColors = {
    success: 'bg-success-50 border-success-200 text-success-800',
    error: 'bg-danger-50 border-danger-200 text-danger-800',
    warning: 'bg-warning-50 border-warning-200 text-warning-800',
    info: 'bg-primary-50 border-primary-200 text-primary-800',
};

function ToastItem({ toast }: { toast: Toast }) {
    const removeToast = useAppStore((state) => state.removeToast);

    return (
        <div
            className={cn(
                'flex items-start gap-3 p-4 rounded-xl border shadow-card',
                'animate-slide-up',
                toastColors[toast.type]
            )}
        >
            <div className="flex-shrink-0">{toastIcons[toast.type]}</div>
            <div className="flex-1 min-w-0">
                <p className="font-medium">{toast.title}</p>
                {toast.message && (
                    <p className="mt-1 text-sm opacity-80">{toast.message}</p>
                )}
            </div>
            <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 p-1 rounded-lg hover:bg-black/10 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export function ToastContainer() {
    const toasts = useAppStore((state) => state.toasts);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} />
            ))}
        </div>
    );
}
