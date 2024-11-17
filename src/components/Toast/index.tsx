import { useEffect } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import styles from './styles.module.css';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
}

export function Toast({ message, type, isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      {type === 'success' ? (
        <FaCheck className={styles.icon} />
      ) : (
        <FaTimes className={styles.icon} />
      )}
      <span className={styles.message}>{message}</span>
    </div>
  );
} 