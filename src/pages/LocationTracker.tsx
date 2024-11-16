import { Header } from '../components/Header';
import { TrackingButton } from '../components/TrackingButton';
import { Dashboard } from '../components/Dashboard';
import { useLocation } from '../hooks/useLocation';
import { styles } from '../styles/layout';

export const LocationTracker: React.FC = () => {
  const {
    currentLocation,
    currentSpeed,
    averageSpeed,
    maxSpeed,
    accuracy,
    isTracking,
    isPrecisionAcceptable,
    startTracking,
    stopTracking,
    unsyncedCount,
    syncData,
  } = useLocation();

  return (
    <div style={styles.container}>
      <Header 
        unsyncedCount={unsyncedCount} 
        onSync={syncData} 
      />

      <main style={{
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        flex: 1,
      }}>
        <TrackingButton
          isTracking={isTracking}
          isPrecisionAcceptable={isPrecisionAcceptable}
          onStartTracking={startTracking}
          onStopTracking={stopTracking}
        />

        <Dashboard
          currentSpeed={currentSpeed}
          averageSpeed={averageSpeed}
          maxSpeed={maxSpeed}
          accuracy={accuracy}
          currentLocation={currentLocation}
        />
      </main>
    </div>
  );
}; 