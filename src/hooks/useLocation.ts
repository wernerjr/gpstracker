import { useState, useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db as localDb } from '../services/localDatabase';
import { syncLocations } from '../services/syncService';

export const useLocation = () => {
  // Estados
  const [isTracking, setIsTracking] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState<number | null>(null);
  const [averageSpeed, setAverageSpeed] = useState<number>(0);
  const [maxSpeed, setMaxSpeed] = useState<number>(0);
  const [unsyncedCount, setUnsyncedCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncStatus, setLastSyncStatus] = useState<{
    date: Date | null;
    count: number;
    error?: string;
  }>({ date: null, count: 0 });

  // Refs
  const watchId = useRef<number | null>(null);
  const lastPosition = useRef<{latitude: number; longitude: number; timestamp: number} | null>(null);
  const speedReadings = useRef<number[]>([]);
  const trackingGuid = useRef<string | null>(null);

  // Função para atualizar contagem de registros não sincronizados
  const updateUnsyncedCount = useCallback(async () => {
    const unsynced = await localDb.getUnsynced();
    setUnsyncedCount(unsynced.length);
  }, []);

  // Função para sincronizar dados
  const syncData = useCallback(async () => {
    try {
      setIsSyncing(true);
      const result = await syncLocations();
      if (result.success) {
        await updateUnsyncedCount();
        setLastSyncStatus({
          date: new Date(),
          count: result.syncedCount
        });
      } else {
        setLastSyncStatus({
          date: new Date(),
          count: 0,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Erro na sincronização:', error);
      setLastSyncStatus({
        date: new Date(),
        count: 0,
        error: 'Erro na sincronização'
      });
    } finally {
      setIsSyncing(false);
    }
  }, [updateUnsyncedCount]);

  // Função para iniciar o monitoramento do GPS
  const startGPSWatch = useCallback(() => {
    if (watchId.current) return;

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy: positionAccuracy } = position.coords;
        const speed = position.coords.speed;
        
        setAccuracy(positionAccuracy);
        setCurrentLocation({ latitude, longitude });
        
        if (isTracking && speed !== null) {
          const speedKmh = speed * 3.6;
          setCurrentSpeed(speedKmh);
        }
      },
      (error) => console.error('Erro de geolocalização:', error),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  }, [isTracking]);

  // Função para iniciar o rastreamento
  const startTracking = useCallback(() => {
    if (isTracking) return;
    
    trackingGuid.current = uuidv4();
    setIsTracking(true);
    speedReadings.current = [];
    setMaxSpeed(0);
    setAverageSpeed(0);

    if (currentLocation) {
      lastPosition.current = {
        ...currentLocation,
        timestamp: Date.now()
      };
    }
  }, [isTracking, currentLocation]);

  // Função para parar o rastreamento
  const stopTracking = useCallback(() => {
    if (!isTracking) return;

    setIsTracking(false);
    trackingGuid.current = null;
    lastPosition.current = null;
    speedReadings.current = [];
  }, [isTracking]);

  // Efeitos
  useEffect(() => {
    startGPSWatch();
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [startGPSWatch]);

  useEffect(() => {
    updateUnsyncedCount();
    const interval = setInterval(updateUnsyncedCount, 30000);
    return () => clearInterval(interval);
  }, [updateUnsyncedCount]);

  useEffect(() => {
    if (!isTracking || !currentLocation || !lastPosition.current) return;

    const now = Date.now();
    const timeInSeconds = (now - lastPosition.current.timestamp) / 1000;

    if (timeInSeconds > 0 && currentSpeed !== null) {
      if (currentSpeed > maxSpeed) {
        setMaxSpeed(currentSpeed);
      }

      speedReadings.current.push(currentSpeed);
      if (speedReadings.current.length > 10) {
        speedReadings.current.shift();
      }
      
      const avgSpeed = speedReadings.current.reduce((a, b) => a + b, 0) / speedReadings.current.length;
      setAverageSpeed(avgSpeed);

      localDb.addLocation({
        guid: trackingGuid.current!,
        trackingId: trackingGuid.current!,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        accuracy: accuracy || 0,
        speed: currentSpeed,
        timestamp: new Date()
      });
    }

    lastPosition.current = {
      ...currentLocation,
      timestamp: now
    };
  }, [isTracking, currentLocation, currentSpeed, accuracy, maxSpeed]);

  return {
    isTracking,
    startTracking,
    stopTracking,
    currentLocation,
    currentSpeed,
    averageSpeed,
    accuracy,
    maxSpeed,
    unsyncedCount,
    syncData,
    updateUnsyncedCount,
    isSyncing,
    lastSyncStatus,
    isPrecisionAcceptable: accuracy !== null && accuracy <= 15,
  };
}; 