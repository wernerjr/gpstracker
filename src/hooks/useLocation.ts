import { useState, useCallback, useEffect, useRef } from 'react';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';
import { db } from '../services/firebase';
import { v4 as uuidv4 } from 'uuid';
import { db as localDb } from '../services/localDatabase';
import { syncLocations } from '../services/syncService';

// Função auxiliar para calcular a distância usando a fórmula de Haversine
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distância em km
};

export const useLocation = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState<number | null>(null);
  const [averageSpeed, setAverageSpeed] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncStatus, setLastSyncStatus] = useState<{
    date: Date | null;
    count: number;
    error?: string;
  }>({ date: null, count: 0 });
  const [unsyncedCount, setUnsyncedCount] = useState<number>(0);
  
  const watchId = useRef<number | null>(null);
  const lastPosition = useRef<{latitude: number; longitude: number; timestamp: number} | null>(null);
  const speedReadings = useRef<number[]>([]);
  const trackingGuid = useRef<string | null>(null);
  const positionBuffer = useRef<{
    latitude: number;
    longitude: number;
    accuracy: number;
    speed: number | null;
    timestamp: Date;
  }[]>([]);
  const processingBuffer = useRef<boolean>(false);
  const MIN_DISTANCE = 0.5; // Distância mínima em metros para registrar nova posição

  // Função para atualizar contagem de não sincronizados
  const updateUnsyncedCount = useCallback(async () => {
    const unsynced = await localDb.getUnsynced();
    setUnsyncedCount(unsynced.length);
  }, []);

  // Função para processar o buffer de posições
  const processPositionBuffer = useCallback(async () => {
    if (processingBuffer.current || !trackingGuid.current || positionBuffer.current.length === 0) {
      return;
    }

    processingBuffer.current = true;
    const positions = [...positionBuffer.current];
    positionBuffer.current = [];

    try {
      for (const position of positions) {
        await localDb.addLocation({
          guid: trackingGuid.current,
          ...position
        });
      }
      await updateUnsyncedCount();
    } catch (error) {
      console.error('Erro ao salvar posições:', error);
      // Em caso de erro, retorna as posições para o buffer
      positionBuffer.current = [...positions, ...positionBuffer.current];
    } finally {
      processingBuffer.current = false;
    }
  }, [updateUnsyncedCount]);

  // Processa o buffer periodicamente
  useEffect(() => {
    if (isTracking) {
      const interval = setInterval(processPositionBuffer, 1000);
      return () => clearInterval(interval);
    }
  }, [isTracking, processPositionBuffer]);

  useEffect(() => {
    if (navigator.geolocation) {
      watchId.current = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude, accuracy: positionAccuracy } = position.coords;
          setAccuracy(positionAccuracy);
          setCurrentLocation({ latitude, longitude });

          if (isTracking && lastPosition.current) {
            const distance = calculateDistance(
              lastPosition.current.latitude,
              lastPosition.current.longitude,
              latitude,
              longitude
            );

            // Só registra se houver movimento significativo
            if (distance >= MIN_DISTANCE) {
              const timeInHours = (position.timestamp - lastPosition.current.timestamp) / 1000 / 3600;
              const speedKmh = timeInHours > 0 ? distance / timeInHours : 0;
              
              setCurrentSpeed(speedKmh);
              speedReadings.current.push(speedKmh);
              
              const avgSpeed = speedReadings.current.reduce((a, b) => a + b, 0) / speedReadings.current.length;
              setAverageSpeed(avgSpeed);

              if (trackingGuid.current) {
                try {
                  console.log('Salvando posição:', {
                    latitude,
                    longitude,
                    accuracy: positionAccuracy,
                    speed: speedKmh,
                    timestamp: new Date(),
                    distance // log da distância para debug
                  });

                  await localDb.addLocation({
                    guid: trackingGuid.current,
                    latitude,
                    longitude,
                    accuracy: positionAccuracy,
                    speed: speedKmh,
                    timestamp: new Date(),
                  });
                  await updateUnsyncedCount();
                } catch (error) {
                  console.error('Erro ao salvar localmente:', error);
                }
              }

              lastPosition.current = { 
                latitude, 
                longitude, 
                timestamp: position.timestamp 
              };
            }
          } else if (isTracking) {
            // Primeira posição do rastreamento
            lastPosition.current = { 
              latitude, 
              longitude, 
              timestamp: position.timestamp 
            };
            
            if (trackingGuid.current) {
              try {
                await localDb.addLocation({
                  guid: trackingGuid.current,
                  latitude,
                  longitude,
                  accuracy: positionAccuracy,
                  speed: 0,
                  timestamp: new Date(),
                });
                await updateUnsyncedCount();
              } catch (error) {
                console.error('Erro ao salvar primeira posição:', error);
              }
            }
          }
        },
        (error) => console.error('Erro de geolocalização:', error),
        {
          enableHighAccuracy: true,
          timeout: 50,
          maximumAge: 0
        }
      );
    }

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [isTracking, updateUnsyncedCount]);

  // Função para calcular distância em metros
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // em metros
  };

  // Processa buffer restante ao parar o rastreamento
  const stopTracking = useCallback(async () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    
    // Processa qualquer posição restante no buffer
    await processPositionBuffer();
    
    setIsTracking(false);
    trackingGuid.current = null;
    speedReadings.current = [];
    setCurrentSpeed(null);
    setAverageSpeed(null);
  }, [processPositionBuffer]);

  const startTracking = useCallback(() => {
    setIsTracking(true);
    trackingGuid.current = uuidv4();
    speedReadings.current = [];
    setCurrentSpeed(null);
    setAverageSpeed(null);
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncLocations();
      setLastSyncStatus({
        date: new Date(),
        count: result.syncedCount,
        error: result.error,
      });
      // Atualizar contagem após sincronização
      await updateUnsyncedCount();
    } finally {
      setIsSyncing(false);
    }
  };

  return {
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
    updateUnsyncedCount,
  };
}; 