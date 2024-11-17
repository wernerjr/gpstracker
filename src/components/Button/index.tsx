import React from 'react';
import styles from './styles.module.css';

interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  variant?: 'success' | 'danger' | 'default';
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  onClick,
  disabled = false,
  icon,
  variant = 'default',
  children
}) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`${styles.button} ${styles[variant]}`}
  >
    {icon && <span className={styles.icon}>{icon}</span>}
    {children}
  </button>
); 