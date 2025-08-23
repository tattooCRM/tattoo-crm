import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Context pour les toasts
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Types de toasts
const toastTypes = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    titleColor: 'text-green-800',
    textColor: 'text-green-700'
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-600',
    titleColor: 'text-red-800',
    textColor: 'text-red-700'
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-600',
    titleColor: 'text-yellow-800',
    textColor: 'text-yellow-700'
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-800',
    textColor: 'text-blue-700'
  }
};

// Composant Toast individuel
const Toast = ({ toast, onRemove }) => {
  const config = toastTypes[toast.type] || toastTypes.info;
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg p-4 mb-3 max-w-sm w-full animate-slide-in-right`}>
      <div className="flex items-start">
        <Icon size={20} className={`${config.iconColor} mt-0.5 mr-3 flex-shrink-0`} />
        <div className="flex-grow">
          {toast.title && (
            <h4 className={`${config.titleColor} font-medium text-sm mb-1`}>
              {toast.title}
            </h4>
          )}
          <p className={`${config.textColor} text-sm`}>
            {toast.message}
          </p>
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className={`${config.iconColor} hover:opacity-70 ml-2 flex-shrink-0`}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

// Container des toasts
const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </div>
  );
};

// Provider des toasts
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', title = null, duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, title };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remove après la durée spécifiée
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Méthodes de convenance
  const toast = {
    success: (message, title = "Succès", duration = 5000) => 
      addToast(message, 'success', title, duration),
    error: (message, title = "Erreur", duration = 7000) => 
      addToast(message, 'error', title, duration),
    warning: (message, title = "Attention", duration = 6000) => 
      addToast(message, 'warning', title, duration),
    info: (message, title = null, duration = 5000) => 
      addToast(message, 'info', title, duration),
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast, removeAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};
