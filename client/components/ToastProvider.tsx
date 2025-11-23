"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  toasts: Toast[];
  push: (message: string, type?: Toast['type']) => void;
  remove: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const push = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  return (
    <ToastContext.Provider value={{ toasts, push, remove }}>
      {children}
      <div className="fixed top-4 right-4 z-[1000] space-y-2 w-72">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`text-sm rounded px-4 py-3 shadow border flex justify-between items-center transition animate-fadeIn ${
              t.type === 'error' ? 'bg-red-600/90 border-red-500 text-white' : t.type === 'success' ? 'bg-green-600/90 border-green-500 text-white' : 'bg-gray-800/90 border-gray-700 text-white'
            }`}
          >
            <span className="pr-2">{t.message}</span>
            <button aria-label="Close" onClick={() => remove(t.id)} className="text-white/70 hover:text-white">×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToasts() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToasts must be used within ToastProvider');
  return ctx;
}

// Simple fade in animation (inline) can be added via global css if desired.
