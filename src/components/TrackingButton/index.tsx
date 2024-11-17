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
    >
      <FaLocationArrow className={styles.buttonIcon} />
      {isTracking ? 'Parar Rastreamento' : 'Iniciar Rastreamento'}
    </button>
  );
} 