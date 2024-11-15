import React from 'react';
import { useLocation } from '../hooks/useLocation';

export const LocationTracker: React.FC = () => {
  const { isTracking, startTracking, stopTracking } = useLocation();

  const handleToggleTracking = () => {
    if (isTracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  return (
    <div className="location-tracker">
      <button 
        onClick={handleToggleTracking}
        className={`tracker-button ${isTracking ? 'tracking' : ''}`}
      >
        {isTracking ? 'Parar Rastreamento' : 'Iniciar Rastreamento'}
      </button>
    </div>
  );
}; 