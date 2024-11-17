import { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import styles from './styles.module.css';

interface ToastProps {
  message: string;
  type: 'error' | 'success' | 'warning';
  onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <span>{message}</span>
      <button onClick={onClose} className={styles.closeButton}>
        <XMarkIcon className={styles.closeIcon} />
      </button>
    </div>
  );
}; 