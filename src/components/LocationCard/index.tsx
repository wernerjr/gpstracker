import styles from './styles.module.css';

interface LocationCardProps {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
}

export function LocationCard({ latitude, longitude, accuracy }: LocationCardProps) {
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
    <div className={styles.coordinatesCard}>
      <div className={styles.speedLabel}>Coordenadas</div>
      <div className={styles.coordinatesValue}>
        {latitude && longitude ? `${latitude}, ${longitude}` : '-'}
      </div>
      {accuracy && (
        <div className={styles.accuracy}>
          Precisão:{' '}
          <span className={`${styles.accuracyValue} ${getAccuracyClass(accuracy)}`}>
            {accuracy.toFixed(1)}m ({getAccuracyLabel(accuracy)})
          </span>
        </div>
      )}
    </div>
  );
} 