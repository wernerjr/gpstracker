import { ExclamationCircleIcon } from '@heroicons/react/24/solid';
import { PrecisionWarning } from './PrecisionWarning';

interface TrackingButtonProps {
  isTracking: boolean;
  isPrecisionAcceptable: boolean;
  onStartTracking: () => void;
  onStopTracking: () => void;
}

export const TrackingButton: React.FC<TrackingButtonProps> = ({
  isTracking,
  isPrecisionAcceptable,
  onStartTracking,
  onStopTracking,
}) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '800px',
    gap: '1rem',
  }}>
    <button
      onClick={isTracking ? onStopTracking : onStartTracking}
      disabled={!isTracking && !isPrecisionAcceptable}
      style={{
        padding: '12px 24px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        backgroundColor: isTracking ? '#e74c3c' : 
                       !isPrecisionAcceptable ? '#666' : '#2ecc71',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: isTracking || isPrecisionAcceptable ? 'pointer' : 'not-allowed',
        transition: 'all 0.3s ease',
        opacity: !isPrecisionAcceptable && !isTracking ? 0.7 : 1,
        width: '100%',
      }}
    >
      {isTracking ? 'Parar Rastreamento' : 'Iniciar Rastreamento'}
    </button>
    
    {!isPrecisionAcceptable && !isTracking && (
      <PrecisionWarning />
    )}
  </div>
); 