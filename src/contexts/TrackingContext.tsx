import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useToast } from '../hooks/useToast';
import { db } from '../services/localDatabase';
import { LocationData, LocationRecord } from '../types/common';
import { v4 as uuidv4 } from 'uuid';

interface TrackingContextData {
  isTracking: boolean;
  currentSpeed: number;
  averageSpeed: number;
  maxSpeed: number;
  accuracy: number | null;
  currentLocation: LocationData | null;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
}

const TrackingContext = createContext<TrackingContextData | undefined>(undefined);

export function TrackingProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();
  const [isTracking, setIsTracking] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [speeds, setSpeeds] = useState<number[]>([]);
  const [maxSpeed, setMaxSpeed] = useState(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [trackingId, setTrackingId] = useState<string | null>(null);

  const averageSpeed = useMemo(() => {
    if (speeds.length === 0) return 0;
    const sum = speeds.reduce((acc, speed) => acc + speed, 0);
    return Math.round(sum / speeds.length);
  }, [speeds]);

  const handlePositionUpdate = useCallback((position: GeolocationPosition) => {
    const speed = position.coords.speed ? Math.round(position.coords.speed * 3.6) : 0;
    
    const locationData: LocationData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      speed,
      timestamp: position.timestamp
    };

    setCurrentSpeed(speed);
    setMaxSpeed(prev => Math.max(prev, speed));
    setSpeeds(prev => [...prev, speed]);
    setAccuracy(position.coords.accuracy);
    setCurrentLocation(locationData);

    // Salvar no banco de dados local
    const locationRecord: LocationRecord = {
      ...locationData,
      guid: uuidv4(),
      trackingId: trackingId || undefined,
      synced: 0
    };

    db.addLocation(locationRecord).catch(error => {
      console.error('Erro ao salvar localização:', error);
    });
  }, [trackingId]);

  const handleError = useCallback((error: GeolocationPositionError) => {
    showToast(`Erro ao obter localização: ${error.message}`, 'error');
    setIsTracking(false);
  }, [showToast]);

  const startTracking = useCallback(async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permission.state === 'denied') {
        throw new Error('Permissão de localização negada');
      }

      const newTrackingId = uuidv4();
      setTrackingId(newTrackingId);

      const id = navigator.geolocation.watchPosition(
        handlePositionUpdate,
        handleError,
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );

      setWatchId(id);
      setIsTracking(true);
      setSpeeds([]);
      setMaxSpeed(0);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      showToast(`Erro ao iniciar rastreamento: ${errorMessage}`, 'error');
    }
  }, [handlePositionUpdate, handleError, showToast]);

  const stopTracking = useCallback(() => {
    try {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      setIsTracking(false);
      setTrackingId(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      showToast(`Erro ao parar rastreamento: ${errorMessage}`, 'error');
    }
  }, [watchId, showToast]);

  const contextValue = useMemo(() => ({
    isTracking,
    currentSpeed,
    averageSpeed,
    maxSpeed,
    accuracy,
    currentLocation,
    startTracking,
    stopTracking
  }), [
    isTracking,
    currentSpeed,
    averageSpeed,
    maxSpeed,
    accuracy,
    currentLocation,
    startTracking,
    stopTracking
  ]);

  return (
    <TrackingContext.Provider value={contextValue}>
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking() {
  const context = useContext(TrackingContext);
  if (context === undefined) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
  return context;
} 