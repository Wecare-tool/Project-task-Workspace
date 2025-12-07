import { create } from 'zustand';
import type { Toast } from '@/types';
import { generateId } from '@utils/index';

interface AppState {
    // Sidebar
    sidebarCollapsed: boolean;
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;

    // Mobile menu
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;

    // Toast notifications
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
    clearToasts: () => void;

    // Loading states
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;

    // Modal
    activeModal: string | null;
    modalData: unknown;
    openModal: (modalId: string, data?: unknown) => void;
    closeModal: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    // Sidebar
    sidebarCollapsed: false,
    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

    // Mobile menu
    mobileMenuOpen: false,
    setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

    // Toast notifications
    toasts: [],
    addToast: (toast) => {
        const id = generateId();
        const newToast = { ...toast, id };
        set((state) => ({ toasts: [...state.toasts, newToast] }));

        // Auto remove after duration
        const duration = toast.duration ?? 5000;
        setTimeout(() => {
            set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
        }, duration);
    },
    removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
    })),
    clearToasts: () => set({ toasts: [] }),

    // Loading
    isLoading: false,
    setIsLoading: (loading) => set({ isLoading: loading }),

    // Modal
    activeModal: null,
    modalData: null,
    openModal: (modalId, data) => set({ activeModal: modalId, modalData: data }),
    closeModal: () => set({ activeModal: null, modalData: null }),
}));

// Toast helper functions
export const toast = {
    success: (title: string, message?: string) => {
        useAppStore.getState().addToast({ type: 'success', title, message });
    },
    error: (title: string, message?: string) => {
        useAppStore.getState().addToast({ type: 'error', title, message });
    },
    warning: (title: string, message?: string) => {
        useAppStore.getState().addToast({ type: 'warning', title, message });
    },
    info: (title: string, message?: string) => {
        useAppStore.getState().addToast({ type: 'info', title, message });
    },
};
