import { useTracking } from '../../contexts/TrackingContext';
import styles from './styles.module.css';
import { TrackingButton } from '../../components/TrackingButton';
import { SpeedCard } from '../../components/SpeedCard';
import { LocationCard } from '../../components/LocationCard';
import UpdateButton from '../../components/UpdateButton';
import { SaveIntervalControl } from '../../components/SaveIntervalControl';

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

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <TrackingButton 
          isTracking={isTracking}
          onStartTracking={startTracking}
          onStopTracking={stopTracking}
        />

        <SaveIntervalControl />

        <div className={styles.cardsGrid}>
          <SpeedCard title="Velocidade Atual" value={currentSpeed} />
          <SpeedCard title="Velocidade Média" value={averageSpeed} />
          <SpeedCard title="Velocidade Máxima" value={maxSpeed} />
        </div>

        <LocationCard 
          latitude={currentLocation?.latitude ?? null}
          longitude={currentLocation?.longitude ?? null}
          accuracy={accuracy}
        />

        <div className={styles.updateButtonContainer}>
          <UpdateButton />
        </div>
      </div>
    </div>
  );
} 