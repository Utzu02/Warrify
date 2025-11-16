export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  title?: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastInstance {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}
