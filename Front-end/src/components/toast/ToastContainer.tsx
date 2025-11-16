import { createPortal } from 'react-dom';
import { ReactNode } from 'react';
import { ToastInstance, ToastVariant } from './types';
import './Toast.css';

const VARIANT_ICONS: Record<ToastVariant, ReactNode> = {
  success: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M9.5 16.17 5.33 12l-1.41 1.41L9.5 19 20.5 8l-1.41-1.41z"
        fill="currentColor"
      />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2 1 21h22L12 2zm0 13a1.5 1.5 0 1 1 1.5-1.5A1.5 1.5 0 0 1 12 15zm1-3.5h-2V8h2z"
        fill="currentColor"
      />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M1 21h22L12 2 1 21zm12-3h-2v-2h2zm0-4h-2v-4h2z"
        fill="currentColor"
      />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M11 17h2v-6h-2zm0-8h2V7h-2zm1-5C6.48 4 3 7.48 3 12s3.48 8 8 8 8-3.48 8-8-3.48-8-8-8z"
        fill="currentColor"
      />
    </svg>
  )
};

interface ToastContainerProps {
  toasts: ToastInstance[];
  onDismiss: (id: string) => void;
}

const ToastContainer = ({ toasts, onDismiss }: ToastContainerProps) => {
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="toast-stack" role="region" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.variant}`}>
          <div className="toast-icon" aria-hidden="true">
            {VARIANT_ICONS[toast.variant]}
          </div>
          <div className="toast-body">
            {toast.title && <p className="toast-title">{toast.title}</p>}
            <p className="toast-message">{toast.message}</p>
          </div>
          <button
            className="toast-dismiss"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
};

export default ToastContainer;
