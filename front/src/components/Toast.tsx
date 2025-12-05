import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Auto dismiss
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  };

  const colors = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-500',
      title: 'text-green-800',
      message: 'text-green-600',
      progress: 'bg-green-500'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-500',
      title: 'text-red-800',
      message: 'text-red-600',
      progress: 'bg-red-500'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-500',
      title: 'text-yellow-800',
      message: 'text-yellow-600',
      progress: 'bg-yellow-500'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-500',
      title: 'text-blue-800',
      message: 'text-blue-600',
      progress: 'bg-blue-500'
    }
  };

  const Icon = icons[type];
  const colorClasses = colors[type];

  return (
    <div
      className={`
        w-full max-w-sm overflow-hidden rounded-xl shadow-lg border
        ${colorClasses.bg} ${colorClasses.border}
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 ${colorClasses.icon}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${colorClasses.title}`}>
              {title}
            </p>
            {message && (
              <p className={`mt-1 text-sm ${colorClasses.message}`}>
                {message}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className={`flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors ${colorClasses.icon}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-1 w-full bg-black/5">
        <div
          className={`h-full ${colorClasses.progress} transition-all ease-linear`}
          style={{
            animation: `shrink ${duration}ms linear forwards`
          }}
        />
      </div>
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

// Toast Container Component
interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          duration={toast.duration}
          onClose={onRemove}
        />
      ))}
    </div>
  );
}

// Custom hook for toast management
export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (title: string, message?: string, duration?: number) => {
    return addToast({ type: 'success', title, message, duration });
  };

  const error = (title: string, message?: string, duration?: number) => {
    return addToast({ type: 'error', title, message, duration });
  };

  const warning = (title: string, message?: string, duration?: number) => {
    return addToast({ type: 'warning', title, message, duration });
  };

  const info = (title: string, message?: string, duration?: number) => {
    return addToast({ type: 'info', title, message, duration });
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    ToastContainer: () => <ToastContainer toasts={toasts} onRemove={removeToast} />
  };
}
