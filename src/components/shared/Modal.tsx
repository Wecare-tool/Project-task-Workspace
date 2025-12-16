import { useEffect, useCallback, type ReactNode } from 'react';
import { cn } from '@utils/index';
import { X } from 'lucide-react';
import { Button } from '@components/ui';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closeOnOverlay?: boolean;
    closeOnEscape?: boolean;
    showCloseButton?: boolean;
    hideHeader?: boolean;
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] h-[90vh]',
};

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md',
    closeOnOverlay = true,
    closeOnEscape = true,
    showCloseButton = true,
    className,
    hideHeader = false,
}: ModalProps) {
    // Handle escape key
    const handleEscape = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape' && closeOnEscape) {
                onClose();
            }
        },
        [closeOnEscape, onClose]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, handleEscape]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-dark-900/50 backdrop-blur-sm animate-fade-in"
                onClick={closeOnOverlay ? onClose : undefined}
            />

            {/* Modal */}
            <div
                className={cn(
                    'relative w-full bg-white rounded-2xl shadow-elevated animate-scale-in',
                    'flex flex-col max-h-[90vh]',
                    sizeClasses[size],
                    className
                )}
            >
                {/* Header */}
                {!hideHeader && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-dark-100">
                        <h2 className="text-lg font-semibold text-dark-900">{title}</h2>
                        {showCloseButton && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="p-2 -mr-2"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                )}

                {/* Floating Close Button */}
                {hideHeader && showCloseButton && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="absolute top-2 right-2 p-2 z-10"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 bg-dark-50 border-t border-dark-100 rounded-b-2xl">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

// Confirm Modal helper
interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'primary';
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    variant = 'danger',
    isLoading = false,
}: ConfirmModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
            footer={
                <div className="flex gap-3 justify-end">
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === 'danger' ? 'danger' : 'primary'}
                        onClick={onConfirm}
                        isLoading={isLoading}
                    >
                        {confirmText}
                    </Button>
                </div>
            }
        >
            <p className="text-dark-600">{message}</p>
        </Modal>
    );
}
