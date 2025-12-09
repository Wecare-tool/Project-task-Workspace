import { Outlet } from 'react-router-dom';
import { useAppStore } from '@stores/index';
import { cn } from '@utils/index';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastProvider } from '@components/shared';
import { X } from 'lucide-react';

export function MainLayout() {
    const { sidebarCollapsed, mobileMenuOpen, setMobileMenuOpen } = useAppStore();

    return (
        <div className="min-h-screen bg-dark-50">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-dark-900/50"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-elevated animate-slide-up">
                        <div className="h-16 flex items-center justify-end px-4 border-b border-dark-100">
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 rounded-lg hover:bg-dark-100 transition-colors"
                                title="Close menu"
                                aria-label="Close menu"
                            >
                                <X className="w-5 h-5 text-dark-500" />
                            </button>
                        </div>
                        <Sidebar />
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div
                className={cn(
                    'transition-all duration-300 ease-in-out',
                    'lg:ml-64',
                    sidebarCollapsed && 'lg:ml-20'
                )}
            >
                <Header />

                <main className="p-3 md:p-4">
                    <Outlet />
                </main>
            </div>

            {/* Toast Container */}
            <ToastProvider />
        </div>
    );
}
