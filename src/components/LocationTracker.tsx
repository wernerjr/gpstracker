import React, { useState, useEffect } from 'react';
import { useLocation } from '../hooks/useLocation';
import { ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';
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
    isTracking, 
    startTracking, 
    stopTracking, 
    currentLocation, 
    currentSpeed, 
    averageSpeed,
    accuracy,
    isSyncing,
    lastSyncStatus,
    handleSync,
    unsyncedCount,
  } = useLocation();

  const isPrecisionAcceptable = accuracy !== null && accuracy <= 15;

  const SyncStatus = () => {
    if (!lastSyncStatus.date && !unsyncedCount) {
      return (
        <div style={{ 
          fontSize: '0.8rem',
          color: '#7f8c8d',
          textAlign: 'right',
        }}>
          Nenhum registro de rastreamento
        </div>
      );
    }

    return (
      <div style={{ 
        fontSize: '0.8rem',
        color: '#7f8c8d',
        textAlign: 'right',
        minWidth: '200px',
      }}>
        {lastSyncStatus.date && (
          <div style={{ 
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '4px',
          }}>
            <CheckCircleIcon style={{ 
              width: '14px', 
              height: '14px',
              color: '#2ecc71'
            }} />
            Última sincronização: {format(lastSyncStatus.date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </div>
        )}

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}>
          {lastSyncStatus.count > 0 && (
            <div style={{ 
              color: '#2ecc71',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '4px',
            }}>
              <span>{lastSyncStatus.count} registro{lastSyncStatus.count !== 1 ? 's' : ''} sincronizado{lastSyncStatus.count !== 1 ? 's' : ''}</span>
            </div>
          )}

          {unsyncedCount > 0 && (
            <div style={{ 
              color: '#e74c3c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '4px',
            }}>
              <ExclamationCircleIcon style={{ width: '14px', height: '14px' }} />
              <span>{unsyncedCount} registro{unsyncedCount !== 1 ? 's' : ''} pendente{unsyncedCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {lastSyncStatus.error && (
          <div style={{ 
            color: '#e74c3c',
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '4px',
          }}>
            <ExclamationCircleIcon style={{ width: '14px', height: '14px' }} />
            <span>Erro: {lastSyncStatus.error}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem',
        backgroundColor: '#2d2d2d',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
          GPS Tracker
        </h1>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <SyncStatus />

          <button 
            onClick={handleSync}
            disabled={isSyncing || unsyncedCount === 0}
            className="sync-button"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              padding: '8px',
              borderRadius: '50%',
              cursor: (isSyncing || unsyncedCount === 0) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              opacity: (isSyncing || unsyncedCount === 0) ? 0.7 : 1,
              color: '#3498db',
            }}
            title={unsyncedCount > 0 ? 
              `Sincronizar ${unsyncedCount} registro${unsyncedCount !== 1 ? 's' : ''} pendente${unsyncedCount !== 1 ? 's' : ''}` : 
              'Não há registros para sincronizar'}
          >
            <ArrowPathIcon 
              className={isSyncing ? 'icon-spin' : ''}
              style={{
                width: '24px',
                height: '24px',
              }}
            />
          </button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div style={{
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
      }}>
        <AccuracyIndicator accuracy={accuracy} />
        
        <button 
          onClick={isTracking ? stopTracking : startTracking}
          disabled={!isTracking && !isPrecisionAcceptable}
          style={{
            padding: '12px 24px',
            fontSize: '1.1rem',
            backgroundColor: isTracking ? '#dc3545' : 
                           !isPrecisionAcceptable ? '#666' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isTracking || isPrecisionAcceptable ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            opacity: !isPrecisionAcceptable && !isTracking ? 0.7 : 1
          }}
        >
          {isTracking ? 'Parar Rastreamento' : 'Iniciar Rastreamento'}
        </button>

        {!isPrecisionAcceptable && !isTracking && (
          <p style={{ 
            color: '#e74c3c', 
            marginTop: '1rem',
            textAlign: 'center' 
          }}>
            Aguardando sinal GPS com precisão adequada...
          </p>
        )}

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
    </div>
  );
}; 