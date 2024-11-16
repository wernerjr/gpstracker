import { 
  BoltIcon, 
  ChartBarIcon, 
  SparklesIcon, 
  SignalIcon, 
  MapPinIcon 
} from '@heroicons/react/24/solid';
import { InfoCard } from '../InfoCard';
import { formatSpeed, formatAccuracy, getAccuracyText, getAccuracyColor } from '../../utils/formatters';
import { LocationData } from '../../types';
import { styles } from './styles';

interface DashboardProps {
  currentSpeed: number | null;
  averageSpeed: number | null;
  maxSpeed: number | null;
  accuracy: number | null;
  currentLocation: LocationData | null;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentSpeed,
  averageSpeed,
  maxSpeed,
  accuracy,
  currentLocation,
}) => (
  <div style={styles.grid}>
    <div style={styles.cardContainer}>
      <InfoCard
        title="Atual"
        value={formatSpeed(currentSpeed)}
        unit="km/h"
        icon={<BoltIcon style={styles.icon} />}
        color="#3498db"
      />
    </div>
    <div style={styles.cardContainer}>
      <InfoCard
        title="Média"
        value={formatSpeed(averageSpeed)}
        unit="km/h"
        icon={<ChartBarIcon style={styles.icon} />}
        color="#2ecc71"
      />
    </div>
    <div style={styles.cardContainer}>
      <InfoCard
        title="Máxima"
        value={formatSpeed(maxSpeed)}
        unit="km/h"
        icon={<SparklesIcon style={styles.icon} />}
        color="#e74c3c"
      />
    </div>
    <div style={styles.cardContainer}>
      <InfoCard
        title="Precisão"
        value={getAccuracyText(accuracy)}
        unit={formatAccuracy(accuracy)}
        icon={<SignalIcon style={styles.icon} />}
        color={getAccuracyColor(accuracy)}
      />
    </div>
    <div style={styles.coordinatesContainer}>
      <InfoCard
        title="Coordenadas"
        value={currentLocation ? 
          `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}` :
          'Aguardando...'}
        unit="lat, long"
        icon={<MapPinIcon style={styles.icon} />}
        color="#9b59b6"
      />
    </div>
  </div>
); 