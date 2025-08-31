'use client';

import { useState, useEffect } from 'react';
import { Check, X, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

type Toast = {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

type ToastProps = {
    toast: Toast;
    onRemove: (id: string) => void;
}

function ToastComponent({ toast, onRemove }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(toast.id);
        }, toast.duration || 3000);

        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onRemove]);

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return <Check className="h-5 w-5" />;
            case 'error':
                return <X className="h-5 w-5" />;
            case 'warning':
                return <AlertCircle className="h-5 w-5" />;
            case 'info':
                return <Info className="h-5 w-5" />;
        }
    };

    const getStyles = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300';
            case 'info':
                return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300';
        }
    };

    return (
        <div className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300 ${getStyles()}`}>
            {getIcon()}
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            <button
                onClick={() => onRemove(toast.id)}
                className="opacity-70 hover:opacity-100 transition-opacity"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

type ToastContainerProps = {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
            {toasts.map((toast) => (
                <ToastComponent key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}

// Toast hook for managing toasts
export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (message: string, type: ToastType = 'info', duration?: number) => {
        const id = Math.random().toString(36).substr(2, 9);
        const toast: Toast = { id, message, type, duration };
        setToasts((prev) => [...prev, toast]);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return {
        toasts,
        addToast,
        removeToast,
        success: (message: string, duration?: number) => addToast(message, 'success', duration),
        error: (message: string, duration?: number) => addToast(message, 'error', duration),
        warning: (message: string, duration?: number) => addToast(message, 'warning', duration),
        info: (message: string, duration?: number) => addToast(message, 'info', duration),
    };
}