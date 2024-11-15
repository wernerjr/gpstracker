import React from 'react';
import { useLocation } from '../hooks/useLocation';

export const LocationTracker: React.FC = () => {
  const { 
    isTracking, 
    startTracking, 
    stopTracking, 
    currentLocation, 
    currentSpeed, 
    averageSpeed 
  } = useLocation();

  return (
    <div>
      <button onClick={isTracking ? stopTracking : startTracking}>
        {isTracking ? 'Parar Rastreamento' : 'Iniciar Rastreamento'}
      </button>

      <div style={{ marginTop: '20px' }}>
        <h3>Informações de Rastreamento:</h3>
        
        <div>
          <strong>Coordenada Atual: </strong>
          {currentLocation ? (
            `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`
          ) : '-'}
        </div>

        <div>
          <strong>Velocidade Atual: </strong>
          {currentSpeed ? `${currentSpeed.toFixed(2)} km/h` : '-'}
        </div>

        <div>
          <strong>Velocidade Média: </strong>
          {averageSpeed ? `${averageSpeed.toFixed(2)} km/h` : '-'}
        </div>
      </div>
    </div>
  );
}; 