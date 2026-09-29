import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className={`toast ${isSuccess ? 'success' : isError ? 'error' : ''}`}>
      {isSuccess && <CheckCircle2 size={18} color="#10b981" />}
      {isError && <AlertTriangle size={18} color="#f43f5e" />}
      {!isSuccess && !isError && <Info size={18} color="#6366f1" />}

      <span style={{ flex: 1 }}>{toast.message}</span>

      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '2px',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
