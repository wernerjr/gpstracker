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
    <div style={{
      backgroundColor: '#1a1a1a',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2rem'
    }}>
      <h1 style={{
        textAlign: 'center',
        width: '100%',
        marginBottom: '2rem'
      }}>
        GPS Tracker
      </h1>
      
      <button 
        onClick={isTracking ? stopTracking : startTracking}
        style={{
          padding: '12px 24px',
          fontSize: '1.1rem',
          backgroundColor: isTracking ? '#dc3545' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        {isTracking ? 'Parar Rastreamento' : 'Iniciar Rastreamento'}
      </button>

      <div style={{ 
        marginTop: '2rem',
        backgroundColor: '#2d2d2d',
        padding: '2rem',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '500px'
      }}>
        <h3 style={{ 
          textAlign: 'center', 
          marginBottom: '1.5rem',
          color: '#fff'
        }}>
          Informações de Rastreamento
        </h3>
        
        <div style={{ marginBottom: '1rem' }}>
          <strong>Coordenada Atual: </strong>
          <span style={{ color: '#8f9' }}>
            {currentLocation ? (
              `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`
            ) : '-'}
          </span>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <strong>Velocidade Atual: </strong>
          <span style={{ color: '#8af' }}>
            {currentSpeed ? `${currentSpeed.toFixed(2)} km/h` : '-'}
          </span>
        </div>

        <div>
          <strong>Velocidade Média: </strong>
          <span style={{ color: '#f8a' }}>
            {averageSpeed ? `${averageSpeed.toFixed(2)} km/h` : '-'}
          </span>
        </div>
      </div>
    </div>
  );
}; 