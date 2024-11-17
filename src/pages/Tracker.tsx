import { useTracking } from '../contexts/TrackingContext';
import styles from './Tracker.module.css';
import { FaLocationArrow } from 'react-icons/fa';

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
          <h3 className={styles.cardTitle}>Coordenadas</h3>
          <p className={styles.coordinates}>
            {currentLocation 
              ? `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`
              : 'Aguardando...'}
          </p>
        </div>

        <div className={styles.precisionIndicator}>
          <div className={`${styles.dot} ${getPrecisionClass()}`} />
          <span className={styles.precisionText}>
            Precisão: {accuracy ? `${accuracy.toFixed(1)}m (${accuracy > 1000 ? 'Baixa' : 'Boa'})` : 'Indisponível'}
          </span>
        </div>
      </div>
    </div>
  );
} 