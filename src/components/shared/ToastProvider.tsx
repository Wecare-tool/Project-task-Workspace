import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
    return (
        <Toaster
            position="bottom-right"
            toastOptions={{
                className: 'text-sm font-medium shadow-elevated rounded-xl',
                duration: 4000,
                style: {
                    background: '#fff',
                    color: '#333',
                    padding: '16px',
                },
                success: {
                    className: '!bg-success-50 !text-success-800 !border !border-success-200',
                    iconTheme: {
                        primary: '#166534',
                        secondary: '#f0fdf4',
                    },
                },
                error: {
                    className: '!bg-danger-50 !text-danger-800 !border !border-danger-200',
                    iconTheme: {
                        primary: '#991b1b',
                        secondary: '#fef2f2',
                    },
                },
                loading: {
                    className: '!bg-primary-50 !text-primary-800 !border !border-primary-200',
                },
            }}
        />
    );
}
