import React, { useState, useEffect } from 'react';
import { useLocation } from '../hooks/useLocation';
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
  const [lastSyncStatus, setLastSyncStatus] = useState<{
    date: Date | null;
    success: boolean;
  }>({
    date: null,
    success: false
  });

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

  // Função para sincronizar e atualizar o status
  const handleSync = async () => {
    try {
      await syncData();
      setLastSyncStatus({
        date: new Date(),
        success: true
      });
    } catch (error) {
      setLastSyncStatus({
        date: new Date(),
        success: false
      });
      console.error('Erro na sincronização:', error);
    }
  };

  const SyncStatus = () => {
    if (!lastSyncStatus.date && !unsyncedCount) {
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: '0.5rem',
          color: '#7f8c8d'
        }}>
          <span style={{ fontSize: '0.8rem' }}>Nenhum registro de rastreamento</span>
        </div>
      );
    }

    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: '0.5rem',
        color: lastSyncStatus.success ? '#2ecc71' : '#e74c3c'
      }}>
        <span style={{ fontSize: '0.8rem' }}>
          {unsyncedCount 
            ? `${unsyncedCount} registros pendentes` 
            : 'Todos os dados sincronizados'}
        </span>
        <button 
          onClick={handleSync}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.5rem',
            cursor: 'pointer',
            color: '#3498db',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ArrowPathIcon style={{ width: '20px', height: '20px' }} />
        </button>
      </div>
    );
  };

  const formatSpeed = (speed: number | null) => {
    if (speed === null) return '0';
    return speed.toFixed(1);
  };

  const formatAccuracy = (accuracy: number | null) => {
    if (accuracy === null) return 'Indisponível';
    return `${accuracy.toFixed(1)}m`;
  };

  const getAccuracyColor = (accuracy: number | null) => {
    if (accuracy === null) return '#666';
    if (accuracy <= 10) return '#2ecc71';
    if (accuracy <= 20) return '#f1c40f';
    return '#e74c3c';
  };

  const getAccuracyText = (accuracy: number | null) => {
    if (accuracy === null) return 'Indisponível';
    if (accuracy <= 10) return 'Excelente';
    if (accuracy <= 20) return 'Boa';
    if (accuracy <= 40) return 'Moderada';
    return 'Baixa';
  };

  const InfoCard = ({ 
    title, 
    value, 
    unit, 
    icon, 
    color = '#3498db',
    size = 'normal'
  }: {
    title: string;
    value: string;
    unit: string;
    icon: React.ReactNode;
    color?: string;
    size?: 'normal' | 'large';
  }) => (
    <div style={{
      backgroundColor: '#2d2d2d',
      padding: '1.25rem',
      borderRadius: '8px',
      border: `2px solid ${color}`,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      overflow: 'hidden',
      height: '100%',
      minHeight: '120px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        position: 'absolute',
        top: '0',
        right: '0',
        backgroundColor: color,
        padding: '0.25rem 0.5rem',
        borderBottomLeftRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        zIndex: 1,
      }}>
        {icon}
        <span style={{ 
          color: '#fff', 
          fontWeight: 'bold',
          fontSize: '0.8rem',
        }}>
          {title}
        </span>
      </div>

      <div style={{
        marginTop: '2rem',
        textAlign: 'center',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <div style={{
          fontSize: size === 'large' ? '1.5rem' : '1.2rem',
          fontWeight: 'bold',
          color: color,
          fontFamily: 'monospace',
          wordBreak: 'break-word',
        }}>
          {value}
        </div>
        <div style={{
          fontSize: '0.8rem',
          color: '#7f8c8d',
          marginTop: '0.25rem',
        }}>
          {unit}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        padding: '1rem',
        backgroundColor: '#2d2d2d',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #3498db',
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>GPS Tracker</h1>
        <SyncStatus />
      </header>

      {/* Conteúdo Principal */}
      <main style={{
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        flex: 1,
      }}>
        {/* Container para botão e mensagem */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          maxWidth: '800px',
          gap: '1rem',
        }}>
          <button
            onClick={isTracking ? stopTracking : startTracking}
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
          
          {/* Mensagem de precisão */}
          {!isPrecisionAcceptable && !isTracking && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#e74c3c',
              fontSize: '0.9rem',
              backgroundColor: 'rgba(231, 76, 60, 0.1)',
              borderRadius: '8px',
              width: '100%',
            }}>
              <ExclamationCircleIcon style={{ width: '20px', height: '20px', padding: '0.75rem' }} />
              <span>Aguardando precisão do GPS melhorar para iniciar...</span>
            </div>
          )}
        </div>

        {/* Grid de Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1.7rem 1rem',
          width: '100%',
          maxWidth: '800px',
        }}>
          {/* Primeira linha */}
          <div style={{ width: '100%', marginBottom: '2rem' }}>
            <InfoCard
              title="Atual"
              value={formatSpeed(currentSpeed)}
              unit="km/h"
              icon={<BoltIcon style={{ width: '16px', height: '16px', color: '#fff' }} />}
              color="#3498db"
            />
          </div>
          <div style={{ width: '100%', marginBottom: '2rem' }}>
            <InfoCard
              title="Média"
              value={formatSpeed(averageSpeed)}
              unit="km/h"
              icon={<ChartBarIcon style={{ width: '16px', height: '16px', color: '#fff' }} />}
              color="#2ecc71"
            />
          </div>

          {/* Segunda linha */}
          <div style={{ width: '100%', marginBottom: '2rem' }}>
            <InfoCard
              title="Máxima"
              value={formatSpeed(maxSpeed)}
              unit="km/h"
              icon={<SparklesIcon style={{ width: '16px', height: '16px', color: '#fff' }} />}
              color="#e74c3c"
            />
          </div>
          <div style={{ width: '100%', marginBottom: '2rem' }}>
            <InfoCard
              title="Precisão"
              value={getAccuracyText(accuracy)}
              unit={formatAccuracy(accuracy)}
              icon={<SignalIcon style={{ width: '16px', height: '16px', color: '#fff' }} />}
              color={getAccuracyColor(accuracy)}
            />
          </div>

          {/* Terceira linha - Coordenadas */}
          <div style={{ 
            gridColumn: '1 / -1', 
            width: '100%',
            marginBottom: '1.5rem'
          }}>
            <InfoCard
              title="Coordenadas"
              value={currentLocation ? 
                `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}` :
                'Aguardando...'}
              unit="lat, long"
              icon={<MapPinIcon style={{ width: '16px', height: '16px', color: '#fff' }} />}
              color="#9b59b6"
            />
          </div>
        </div>
      </main>
    </div>
  );
}; 