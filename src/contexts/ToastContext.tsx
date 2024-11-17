import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast } from '../components/Toast';

interface ToastContextData {
  showToast: (message: string, type: 'success' | 'error') => void;
  hideToast: () => void;
}

export const ToastContext = createContext<ToastContextData>({
  showToast: () => {},
  hideToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({
      message,
      type,
      isVisible: true,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({
      ...prev,
      isVisible: false,
    }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}; 