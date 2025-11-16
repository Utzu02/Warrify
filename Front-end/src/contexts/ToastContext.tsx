import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import ToastContainer from '../components/toast/ToastContainer';
import { ToastInstance, ToastOptions } from '../components/toast/types';

interface ToastContextValue {
  showToast: (options: ToastOptions) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastInstance[]>([]);
  const timeoutRef = useRef<Record<string, number>>({});

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    if (timeoutRef.current[id]) {
      window.clearTimeout(timeoutRef.current[id]);
      delete timeoutRef.current[id];
    }
  }, []);

  const showToast = useCallback(
    (options: ToastOptions) => {
      const id = generateId();
      const toast: ToastInstance = {
        id,
        title: options.title,
        message: options.message,
        variant: options.variant ?? 'info',
        duration: options.duration ?? 4000
      };

      setToasts((prev) => [...prev, toast]);

      if (toast.duration > 0) {
        timeoutRef.current[id] = window.setTimeout(() => {
          removeToast(id);
        }, toast.duration);
      }

      return id;
    },
    [removeToast]
  );

  useEffect(() => {
    const timers = timeoutRef.current;
    return () => {
      Object.keys(timers).forEach((key) => {
        window.clearTimeout(timers[key]);
      });
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
