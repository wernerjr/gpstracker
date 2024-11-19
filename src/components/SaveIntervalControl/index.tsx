import { useTracking } from '../../contexts/TrackingContext';
import styles from './styles.module.css';

const INTERVAL_OPTIONS = [
  { value: 0, label: 'Tempo Real' },
  { value: 5, label: '5 seg' },
  { value: 10, label: '10 seg' },
  { value: 30, label: '30 seg' },
  { value: 60, label: '1 min' }
];

export function SaveIntervalControl() {
  const { saveInterval, setSaveInterval } = useTracking();

  return (
    <div className={styles.container}>
      <div className={styles.label}>Intervalo de Gravação:</div>
      <div className={styles.buttonGroup}>
        {INTERVAL_OPTIONS.map(option => (
          <button
            key={option.value}
            onClick={() => setSaveInterval(option.value)}
            className={`${styles.intervalButton} ${
              saveInterval === option.value ? styles.active : ''
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
} 