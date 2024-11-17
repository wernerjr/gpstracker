import { useTracking } from '../contexts/TrackingContext';
import styles from './Tracker.module.css';
import { FaLocationArrow } from 'react-icons/fa';
import UpdateButton from '../components/UpdateButton';

export function Tracker() {
  const { 
    isTracking, 
    startTracking, 
    stopTracking, 
    currentSpeed = 0,
    averageSpeed = 0,
    maxSpeed = 0,
    accuracy = null,
    currentLocation = null
  } = useTracking();

  // Função auxiliar para determinar a classe do indicador de precisão
  const getPrecisionClass = () => {
    if (!accuracy) return styles.unknown;
    return accuracy > 1000 ? styles.low : styles.good;
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <button 
          onClick={isTracking ? stopTracking : startTracking}
          className={`${styles.trackingButton} ${isTracking ? styles.stopping : ''}`}
        >
          <FaLocationArrow className={styles.buttonIcon} />
          {isTracking ? 'Parar Rastreamento' : 'Iniciar Rastreamento'}
        </button>

        <div className={styles.cardsGrid}>
          {[
            { title: 'Velocidade Atual', value: currentSpeed },
            { title: 'Velocidade Média', value: averageSpeed },
            { title: 'Velocidade Máxima', value: maxSpeed }
          ].map((item, index) => (
            <div key={index} className={styles.card}>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardValue}>
                {Number(item.value).toFixed(1)} <span className={styles.unit}>km/h</span>
              </p>
            </div>
          ))}
        </div>

        <div className={styles.coordinatesCard}>
          <div className={styles.speedLabel}>Coordenadas</div>
          <div className={styles.coordinatesValue}>
            {currentLocation ? `${currentLocation.latitude}, ${currentLocation.longitude}` : '-'}
          </div>
          {accuracy && (
            <div className={styles.accuracy}>
              Precisão:{' '}
              <span className={`
                ${styles.accuracyValue}
                ${accuracy < 10 ? styles.accuracyLow : ''}
                ${accuracy >= 10 && accuracy < 30 ? styles.accuracyMedium : ''}
                ${accuracy >= 30 ? styles.accuracyHigh : ''}
              `}>
                {accuracy.toFixed(1)}m ({accuracy < 10 ? 'Excelente' : accuracy < 30 ? 'Boa' : 'Inadequada'})
              </span>
            </div>
          )}
        </div>

        <div className={styles.updateButtonContainer}>
          <UpdateButton />
        </div>
      </div>
    </div>
  );
} 