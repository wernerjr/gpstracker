import React, { useState, useEffect } from 'react';
import { useTracking } from '../contexts/TrackingContext';
import { ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon, SparklesIcon, MapPinIcon, BoltIcon, ChartBarIcon, SignalIcon } from '@heroicons/react/24/solid';
import { db as localDb } from '../services/localDatabase';
import './LocationTracker.css';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AccuracyIndicator = ({ accuracy }: { accuracy: number | null }) => {
  const getAccuracyColor = (accuracy: number | null) => {
    if (!accuracy) return '#e74c3c'; // vermelho por padrão
    if (accuracy < 5) return '#2ecc71';  // verde
    if (accuracy < 15) return '#f1c40f'; // amarelo
    return '#e74c3c'; // vermelho
  };

  const getAccuracyText = (accuracy: number | null) => {
    if (!accuracy) return 'Sem sinal';
    if (accuracy < 5) return 'Excelente';
    if (accuracy < 15) return 'Boa';
    return 'Baixa';
  };

  const color = getAccuracyColor(accuracy);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '1rem'
    }}>
      <div style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: color,
        boxShadow: `0 0 10px ${color}`,
        transition: 'all 0.3s ease'
      }} />
      <span>
        Precisão: {accuracy ? `${accuracy.toFixed(1)}m (${getAccuracyText(accuracy)})` : '-'}
      </span>
    </div>
  );
};

export const LocationTracker: React.FC = () => {
  const {
    currentLocation,
    currentSpeed,
    averageSpeed,
    maxSpeed,
    accuracy,
    isTracking,
    startTracking,
    stopTracking,
  } = useTracking();

  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <main style={{
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        flex: 1,
      }}>
        {accuracy === null ? (
          <div style={{
            color: '#f1c40f',
            padding: '1rem',
            textAlign: 'center',
            width: '100%',
            backgroundColor: 'rgba(241, 196, 15, 0.1)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}>
            <svg 
              className="animate-spin" 
              style={{ 
                width: '20px', 
                height: '20px',
                animation: 'spin 1s linear infinite'
              }} 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Aguardando sinal do GPS...
          </div>
        ) : (
          <>
            <button 
              onClick={isTracking ? stopTracking : startTracking}
              style={{
                padding: '1rem 2rem',
                borderRadius: '8px',
                backgroundColor: isTracking ? '#e74c3c' : '#2ecc71',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '1rem'
              }}
            >
              {isTracking ? 'Parar Rastreamento' : 'Iniciar Rastreamento'}
            </button>

            <div style={{
              display: 'grid',
              gap: '1rem',
              width: '100%',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <AccuracyIndicator accuracy={accuracy} />
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem'
              }}>
                <div style={{
                  backgroundColor: '#2a2a2a',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <h3>Velocidade Atual</h3>
                  <p>{currentSpeed?.toFixed(1) || '0'} km/h</p>
                </div>
                
                <div style={{
                  backgroundColor: '#2a2a2a',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <h3>Velocidade Média</h3>
                  <p>{averageSpeed?.toFixed(1) || '0'} km/h</p>
                </div>
                
                <div style={{
                  backgroundColor: '#2a2a2a',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <h3>Velocidade Máxima</h3>
                  <p>{maxSpeed?.toFixed(1) || '0'} km/h</p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}; 