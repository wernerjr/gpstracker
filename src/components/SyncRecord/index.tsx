import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPinIcon, ChartBarIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/outline';
import styles from './styles.module.css';
import { LocationRecord } from '../../types/common';

interface SyncRecordProps {
  record: LocationRecord;
  onDelete: (id: number) => void;
}

export const SyncRecord = ({ record, onDelete }: SyncRecordProps) => {
  const getAccuracyLabel = (accuracy: number) => {
    if (accuracy < 10) return 'Excelente';
    if (accuracy < 30) return 'Boa';
    return 'Inadequada';
  };

  const getAccuracyClass = (accuracy: number) => {
    if (accuracy < 10) return styles.accuracyLow;
    if (accuracy < 30) return styles.accuracyMedium;
    return styles.accuracyHigh;
  };

  const safeToFixed = (num: number | undefined | null, decimals: number = 2): string => {
    if (num === undefined || num === null) return '0';
    return num.toFixed(decimals);
  };

  return (
    <div className={styles.recordItem}>
      <div className={styles.recordDetails}>
        <div className={styles.detailItem}>
          <MapPinIcon className={styles.icon} />
          <span className={styles.label}>Localização:</span>
          <span className={styles.value}>
            {safeToFixed(record.latitude, 6)}, {safeToFixed(record.longitude, 6)}
          </span>
        </div>
        
        <div className={styles.detailItem}>
          <ChartBarIcon className={styles.icon} />
          <span className={styles.label}>Velocidade:</span>
          <span className={styles.value}>
            {safeToFixed(record.speed, 1)} km/h
          </span>
        </div>

        <div className={styles.detailItem}>
          <span className={styles.label}>Precisão:</span>
          <span className={`${styles.value} ${getAccuracyClass(record.accuracy)}`}>
            {safeToFixed(record.accuracy, 1)}m ({getAccuracyLabel(record.accuracy)})
          </span>
        </div>
        
        <div className={styles.detailItem}>
          <ClockIcon className={styles.icon} />
          <span className={styles.label}>Data:</span>
          <span className={styles.value}>
            {record.timestamp ? format(new Date(record.timestamp), 'PPpp', { locale: ptBR }) : '-'}
          </span>
        </div>
      </div>
      <button 
        onClick={() => onDelete(record.id!)}
        className={styles.deleteButton}
        title="Excluir registro"
      >
        <TrashIcon className={styles.deleteIcon} />
      </button>
    </div>
  );
}; 