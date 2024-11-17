import { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { v4 } from 'uuid';
import { db } from '../services/localDatabase';
import type { LocationData, LocationRecord } from '../types/common';
import { useSync } from './SyncContext';
import { GPS_CONFIG } from '../constants';
import { emitNewLocationRecord } from '../utils/events';
import { useToast } from '../hooks/useToast';

interface TrackingContextData {
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  currentSpeed: number;
  averageSpeed: number;
  maxSpeed: number;
  accuracy: number | null;
  currentLocation: LocationData | null;
}

const TrackingContext = createContext<TrackingContextData>({} as TrackingContextData);

export function TrackingProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const [isTracking, setIsTracking] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [averageSpeed, setAverageSpeed] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  
  const watchId = useRef<number | null>(null);
  const trackingGuid = useRef<string | null>(null);
  const speedReadings = useRef<number[]>([]);
  const { updateUnsyncedCount } = useSync();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed !== null ? position.coords.speed * 3.6 : 0,
          timestamp: position.timestamp
        });
        setAccuracy(position.coords.accuracy);
      },
      (error) => console.error('Erro ao obter posição inicial:', error),
      {
        enableHighAccuracy: GPS_CONFIG.HIGH_ACCURACY,
        timeout: GPS_CONFIG.TIMEOUT,
        maximumAge: GPS_CONFIG.MAX_AGE
      }
    );
  }, []);

  const calculateAverageSpeed = useCallback((speeds: number[]): number => {
    if (speeds.length === 0) return 0;
    const sum = speeds.reduce((acc, speed) => acc + speed, 0);
    return sum / speeds.length;
  }, []);

  const handlePositionUpdate = useCallback(async (position: GeolocationPosition) => {
    if (!isTracking || !trackingGuid.current) return;

    const speed = position.coords.speed !== null ? position.coords.speed * 3.6 : 0;
    
    setCurrentSpeed(speed);
    setCurrentLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      speed,
      timestamp: position.timestamp
    });
    setAccuracy(position.coords.accuracy);

    speedReadings.current.push(speed);
    setAverageSpeed(calculateAverageSpeed(speedReadings.current));
    setMaxSpeed(Math.max(...speedReadings.current));

    try {
      await db.addLocation({
        guid: trackingGuid.current,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        speed,
        timestamp: position.timestamp
      });
      
      await updateUnsyncedCount();
      emitNewLocationRecord();
    } catch (error) {
      console.error('Erro ao salvar localização:', error);
    }
  }, [isTracking, updateUnsyncedCount]);

  const checkGPSPermissions = async (): Promise<boolean> => {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state === 'granted';
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      return false;
    }
  };

  const startTracking = useCallback(async () => {
    try {
      const hasPermission = await checkGPSPermissions();
      if (!hasPermission) {
        showToast('Permissão de GPS negada', 'error');
        return;
      }
      
      setCurrentSpeed(0);
      setAverageSpeed(0);
      setMaxSpeed(0);
      speedReadings.current = [];
      trackingGuid.current = v4();
      setIsTracking(true);
      showToast('Rastreamento iniciado', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      showToast(`Erro ao iniciar rastreamento: ${errorMessage}`, 'error');
    }
  }, [showToast]);

  const stopTracking = useCallback(() => {
    try {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      setIsTracking(false);
      trackingGuid.current = null;
      showToast('Rastreamento finalizado', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      showToast(`Erro ao parar rastreamento: ${errorMessage}`, 'error');
    }
  }, [showToast]);

  useEffect(() => {
    if (!watchId.current) {
      watchId.current = navigator.geolocation.watchPosition(
        handlePositionUpdate,
        (error) => console.error('Erro no GPS:', error),
        {
          enableHighAccuracy: GPS_CONFIG.HIGH_ACCURACY,
          timeout: GPS_CONFIG.TIMEOUT,
          maximumAge: GPS_CONFIG.MAX_AGE
        }
      );
    }

    return () => {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [handlePositionUpdate]);

  const value = useMemo(() => ({
    isTracking,
    startTracking,
    stopTracking,
    currentSpeed,
    averageSpeed,
    maxSpeed,
    accuracy,
    currentLocation
  }), [
    isTracking,
    startTracking,
    stopTracking,
    currentSpeed,
    averageSpeed,
    maxSpeed,
    accuracy,
    currentLocation
  ]);

  return (
    <TrackingContext.Provider value={value}>
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking() {
  const context = useContext(TrackingContext);
  
  if (context === undefined || Object.keys(context).length === 0) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
  
  return context;
} 