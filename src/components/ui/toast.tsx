"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

export type Toast = {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
};

type ToastContextType = {
    toasts: Toast[];
    addToast: (message: string, type: Toast['type'], duration?: number) => void;
    removeToast: (id: string) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: Toast['type'], duration = 5000) => {
        const id = Math.random().toString(36).substr(2, 9);
        const toast: Toast = { id, message, type, duration };
        
        setToasts(prev => [...prev, toast]);
        
        if (duration > 0) {
            setTimeout(() => removeToast(id), duration);
        }
    }, [removeToast]);

    const success = useCallback((message: string, duration = 5000) => {
        addToast(message, 'success', duration);
    }, [addToast]);

    const error = useCallback((message: string, duration = 5000) => {
        addToast(message, 'error', duration);
    }, [addToast]);

    const info = useCallback((message: string, duration = 5000) => {
        addToast(message, 'info', duration);
    }, [addToast]);

    const warning = useCallback((message: string, duration = 5000) => {
        addToast(message, 'warning', duration);
    }, [addToast]);

    const contextValue = useMemo(() => ({
        toasts,
        addToast,
        removeToast,
        success,
        error,
        info,
        warning
    }), [toasts, addToast, removeToast, success, error, info, warning]);

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const bgColor = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    }[toast.type];

    const icon = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    }[toast.type];

    return (
        <div className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-[500px]`}>
            <span className="flex-shrink-0 text-lg">{icon}</span>
            <span className="flex-1 text-sm">{toast.message}</span>
            <button 
                onClick={() => onRemove(toast.id)}
                className="flex-shrink-0 text-white/80 hover:text-white text-lg font-bold"
                aria-label="Close"
            >
                ×
            </button>
        </div>
    );
}
