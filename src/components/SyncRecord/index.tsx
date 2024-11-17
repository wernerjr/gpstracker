import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPinIcon, ChartBarIcon, ClockIcon, TrashIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
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

  return (
    <div className={styles.recordItem}>
      <div className={styles.recordContent}>
        <div className={styles.row}>
          <div className={styles.field}>
            <MapPinIcon className={styles.icon} />
            <span className={styles.label}>Localização:</span>
            <span className={styles.value}>
              {record.latitude.toFixed(6)}, {record.longitude.toFixed(6)}
            </span>
          </div>
          <button 
            onClick={() => onDelete(record.id!)}
            className={styles.deleteButton}
          >
            <TrashIcon className={styles.icon} />
          </button>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <ChartBarIcon className={styles.icon} />
            <span className={styles.label}>Velocidade:</span>
            <span className={styles.value}>{record.speed.toFixed(1)} km/h</span>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Precisão:</span>
            <span className={`${styles.value} ${getAccuracyClass(record.accuracy)}`}>
              {record.accuracy.toFixed(1)}m ({getAccuracyLabel(record.accuracy)})
            </span>
          </div>
          <div className={styles.field}>
            <ClockIcon className={styles.icon} />
            <span className={styles.label}>Data:</span>
            <span className={styles.value}>
              {format(new Date(record.timestamp), "dd MMM yyyy, HH:mm:ss", { locale: ptBR })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}; 