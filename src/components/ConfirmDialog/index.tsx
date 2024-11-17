import { useEffect } from 'react';
import styles from './styles.module.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel 
}: ConfirmDialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        <div className={styles.buttons}>
          <button 
            onClick={onCancel}
            className={`${styles.button} ${styles.cancelButton}`}
          >
            Cancelar
          </button>
          <button 
            onClick={onConfirm}
            className={`${styles.button} ${styles.confirmButton}`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
} 