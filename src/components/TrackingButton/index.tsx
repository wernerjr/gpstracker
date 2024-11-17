import { FaLocationArrow } from 'react-icons/fa';
import styles from './styles.module.css';

interface TrackingButtonProps {
  isTracking: boolean;
  onStartTracking: () => void;
  onStopTracking: () => void;
}

export function TrackingButton({ isTracking, onStartTracking, onStopTracking }: TrackingButtonProps) {
  return (
    <button 
      onClick={isTracking ? onStopTracking : onStartTracking}
      className={`${styles.trackingButton} ${isTracking ? styles.stopping : ''}`}
      aria-label={isTracking ? 'Parar rastreamento' : 'Iniciar rastreamento'}
      role="switch"
      aria-checked={isTracking}
    >
      <FaLocationArrow className={styles.buttonIcon} aria-hidden="true" />
      <span>{isTracking ? 'Parar Rastreamento' : 'Iniciar Rastreamento'}</span>
    </button>
  );
} 