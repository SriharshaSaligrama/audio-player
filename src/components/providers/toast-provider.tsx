'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useToast, ToastContainer, ToastType } from '@/components/ui/toast';

type ToastContextType = {
    addToast: (message: string, type?: ToastType, duration?: number) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const toast = useToast();

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
        </ToastContext.Provider>
    );
}

export function useToastContext() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToastContext must be used within a ToastProvider');
    }
    return context;
}