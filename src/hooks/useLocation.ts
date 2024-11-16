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
  const [maxSpeed, setMaxSpeed] = useState<number>(0);
  
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

  // Calcular isPrecisionAcceptable baseado na accuracy
  const isPrecisionAcceptable = accuracy !== null && accuracy <= 15;

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
          latitude: position.latitude,
          longitude: position.longitude,
          accuracy: position.accuracy,
          speed: position.speed ?? 0,
          timestamp: position.timestamp
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

  const savePositions = async (positions: Array<{
    latitude: number;
    longitude: number;
    accuracy: number;
    speed: number | null;
    timestamp: Date;
  }>) => {
    if (!trackingGuid.current) return;

    try {
      for (const position of positions) {
        await localDb.addLocation({
          guid: trackingGuid.current,
          latitude: position.latitude,
          longitude: position.longitude,
          accuracy: position.accuracy,
          speed: position.speed ?? 0,
          timestamp: position.timestamp
        });
      }
      await updateUnsyncedCount();
    } catch (error) {
      console.error('Erro ao salvar posições:', error);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      watchId.current = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude, accuracy: positionAccuracy } = position.coords;
          const speed = position.coords.speed;
          
          setAccuracy(positionAccuracy);
          setCurrentLocation({ latitude, longitude });

          if (isTracking && lastPosition.current) {
            const distance = calculateDistance(
              lastPosition.current.latitude,
              lastPosition.current.longitude,
              latitude,
              longitude
            );

            // Calcula o tempo em segundos
            const timeInSeconds = (position.timestamp - lastPosition.current.timestamp) / 1000;
            
            // Calcula a velocidade em km/h
            // distance está em metros, timeInSeconds em segundos
            // (metros / segundos) * (3600 segundos / 1 hora) * (1 km / 1000 metros)
            const speedKmh = timeInSeconds > 0 
              ? (distance / timeInSeconds) * 3.6 // Converte m/s para km/h
              : 0;

            // Filtra velocidades irreais (acima de 200 km/h)
            const filteredSpeed = speedKmh > 200 ? lastSpeed.current || 0 : speedKmh;
            lastSpeed.current = filteredSpeed;
            
            setCurrentSpeed(filteredSpeed);
            
            // Atualiza velocidade máxima
            if (filteredSpeed > maxSpeed) {
              setMaxSpeed(filteredSpeed);
            }

            // Mantém apenas as últimas 10 leituras para a média
            speedReadings.current.push(filteredSpeed);
            if (speedReadings.current.length > 10) {
              speedReadings.current.shift();
            }
            
            const avgSpeed = speedReadings.current.reduce((a, b) => a + b, 0) / speedReadings.current.length;
            setAverageSpeed(avgSpeed);

            if (trackingGuid.current) {
              try {
                await localDb.addLocation({
                  guid: trackingGuid.current,
                  latitude,
                  longitude,
                  accuracy: positionAccuracy,
                  speed: currentSpeed ?? 0,
                  timestamp: new Date()
                });
                await updateUnsyncedCount();
              } catch (error) {
                console.error('Erro ao salvar localmente:', error);
              }
            }
          }

          lastPosition.current = { 
            latitude, 
            longitude, 
            timestamp: position.timestamp 
          };
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
  }, [isTracking, updateUnsyncedCount, maxSpeed]);

  // Adicione esta referência para a última velocidade válida
  const lastSpeed = useRef<number>(0);

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
    setMaxSpeed(0); // Reseta a velocidade máxima ao parar
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

  // Função para sincronizar dados
  const syncData = useCallback(async () => {
    try {
      const unsynced = await localDb.getUnsynced();
      if (unsynced.length === 0) return;

      console.log('Sincronizando dados...', unsynced.length);
      
      // Filtrar apenas os IDs definidos
      const ids = unsynced
        .map(record => record.id)
        .filter((id): id is number => id !== undefined);

      if (ids.length > 0) {
        await localDb.markAsSynced(ids);
      }
      
      await updateUnsyncedCount();
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
    }
  }, []);

  // Atualizar contador ao montar o componente
  useEffect(() => {
    updateUnsyncedCount();
  }, [updateUnsyncedCount]);

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
    maxSpeed,
    syncData,
    isPrecisionAcceptable,
  };
}; 