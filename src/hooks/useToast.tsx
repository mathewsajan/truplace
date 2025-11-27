import { useState, useCallback } from 'react';
import { ToastType, ToastData } from '../components/ToastContainer';

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message: string) => {
    addToast('success', message);
  }, [addToast]);

  const error = useCallback((message: string) => {
    addToast('error', message);
  }, [addToast]);

  const warning = useCallback((message: string) => {
    addToast('warning', message);
  }, [addToast]);

  const info = useCallback((message: string) => {
    addToast('info', message);
  }, [addToast]);

  return {
    toasts,
    removeToast,
    success,
    error,
    warning,
    info,
  };
};
