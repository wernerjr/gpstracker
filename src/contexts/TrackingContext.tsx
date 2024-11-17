import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db, LocationRecord } from '../services/localDatabase';
import { LocationData } from '../types';
import { useSync } from './SyncContext';

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
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const watchId = useRef<number | null>(null);
  const trackingGuid = useRef<string | null>(null);
  const speedReadings = useRef<number[]>([]);
  const lastSaveTime = useRef<number>(0);
  const { updateUnsyncedCount } = useSync();

  const SAVE_INTERVAL = 5000;

  const saveLocation = useCallback(async (position: GeolocationPosition) => {
    if (!trackingGuid.current || !isTracking) {
      console.log('Ignorando salvamento: tracking não iniciado ou parado');
      return;
    }

    const now = Date.now();
    if (now - lastSaveTime.current < SAVE_INTERVAL) {
      console.log('Ignorando salvamento: intervalo muito curto');
      return;
    }

    try {
      console.log('Salvando localização...', {
        guid: trackingGuid.current,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });

      const locationRecord: LocationRecord = {
        guid: crypto.randomUUID(),
        trackingId: trackingGuid.current,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        speed: position.coords.speed || 0,
        accuracy: position.coords.accuracy || 0,
        timestamp: new Date(position.timestamp),
        synced: 0
      };

      await db.locations.add(locationRecord);
      lastSaveTime.current = now;
      updateUnsyncedCount();
      
      console.log('Localização salva com sucesso');
    } catch (error) {
      console.error('Erro ao salvar localização:', error);
    }
  }, [isTracking, updateUnsyncedCount]);

  const handlePositionUpdate = useCallback((position: GeolocationPosition) => {
    const speed = position.coords.speed || 0;
    speedReadings.current.push(speed);
    
    if (speedReadings.current.length > 10) {
      speedReadings.current.shift();
    }

    setCurrentLocation({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      speed: speed,
      timestamp: position.timestamp
    });
    
    setAccuracy(position.coords.accuracy || 0);

    saveLocation(position);
  }, [saveLocation]);

  const startTracking = useCallback(() => {
    if (!isTracking) {
      console.log('Iniciando rastreamento...');
      trackingGuid.current = crypto.randomUUID();
      speedReadings.current = [];
      lastSaveTime.current = 0;

      watchId.current = navigator.geolocation.watchPosition(
        handlePositionUpdate,
        (error) => console.error('Erro de GPS:', error),
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );

      setIsTracking(true);
      console.log('Rastreamento iniciado com ID:', trackingGuid.current);
    }
  }, [isTracking, handlePositionUpdate]);

  const stopTracking = useCallback(() => {
    console.log('Parando rastreamento...');
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setIsTracking(false);
    trackingGuid.current = null;
    console.log('Rastreamento parado');
  }, []);

  useEffect(() => {
    if (!watchId.current) {
      console.log('Iniciando monitoramento GPS');
      watchId.current = navigator.geolocation.watchPosition(
        handlePositionUpdate,
        (error) => console.error('Erro no GPS:', error),
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      );
    }

    return () => {
      if (watchId.current) {
        console.log('Limpando monitoramento GPS');
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [handlePositionUpdate]);

  const calculateAverageSpeed = useCallback(() => {
    if (speedReadings.current.length === 0) return 0;
    
    const sum = speedReadings.current.reduce((acc, speed) => acc + speed, 0);
    return (sum / speedReadings.current.length) * 3.6; // Convertendo para km/h
  }, []);

  const calculateMaxSpeed = useCallback(() => {
    if (speedReadings.current.length === 0) return 0;
    
    return Math.max(...speedReadings.current) * 3.6; // Convertendo para km/h
  }, []);

  return (
    <TrackingContext.Provider value={{
      isTracking,
      startTracking,
      stopTracking,
      currentSpeed: currentLocation?.speed ? currentLocation.speed * 3.6 : 0,
      averageSpeed: calculateAverageSpeed(),
      maxSpeed: calculateMaxSpeed(),
      accuracy,
      currentLocation
    }}>
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking() {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
  return context;
} 