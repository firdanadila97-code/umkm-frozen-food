'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  title: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (title: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((title: string, variant: ToastVariant = 'success') => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, title, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex max-w-sm flex-col gap-2.5"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg transition-all"
          >
            {toast.variant === 'success' && (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
            )}
            {toast.variant === 'error' && (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            )}
            {toast.variant === 'info' && (
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            )}
            <p className="flex-1 text-sm font-medium text-slate-800">{toast.title}</p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Tutup notifikasi"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast harus digunakan di dalam ToastProvider');
  }
  return context;
}
