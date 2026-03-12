// ============================================
// Toast Notification Component
// ============================================

import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

const icons = {
  success: <CheckCircle className="w-5 h-5 text-brand-400" />,
  error: <XCircle className="w-5 h-5 text-red-400" />,
  warning: <AlertCircle className="w-5 h-5 text-yellow-400" />,
};

const Toast = ({ message, type = "success", onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className="flex items-start gap-3 bg-surface-700 border border-surface-500 rounded-xl p-4 shadow-2xl min-w-[280px] max-w-sm animate-slide-up">
      {icons[type]}
      <p className="text-sm text-gray-100 flex-1">{message}</p>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-300 ml-2">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Toast Container — renders all toasts
export const ToastContainer = ({ toasts, removeToast }) => (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
    {toasts.map((toast) => (
      <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
    ))}
  </div>
);

export default Toast;