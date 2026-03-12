// ============================================
// useToast Hook
// Manages toast notification state
// ============================================

import { useState, useCallback } from "react";

let idCounter = 0;

const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, "success"),
    error: (msg) => addToast(msg, "error"),
    warning: (msg) => addToast(msg, "warning"),
  };

  return { toasts, removeToast, toast };
};

export default useToast;