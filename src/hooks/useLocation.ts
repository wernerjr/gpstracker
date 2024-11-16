import { useState, useCallback, useEffect, useRef } from 'react';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';
import { db } from '../services/firebase';
import { v4 as uuidv4 } from 'uuid';

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
  
  const watchId = useRef<number | null>(null);
  const lastPosition = useRef<{latitude: number; longitude: number; timestamp: number} | null>(null);
  const speedReadings = useRef<number[]>([]);
  const trackingGuid = useRef<string | null>(null);

  // Inicia o monitoramento do GPS assim que o componente é montado
  useEffect(() => {
    if (navigator.geolocation) {
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy: positionAccuracy } = position.coords;
          setAccuracy(positionAccuracy);
          setCurrentLocation({ latitude, longitude });

          // Só calcula velocidade e envia para Firebase se estiver rastreando
          if (isTracking && lastPosition.current) {
            const distance = calculateDistance(
              lastPosition.current.latitude,
              lastPosition.current.longitude,
              latitude,
              longitude
            );
            const timeInHours = (position.timestamp - lastPosition.current.timestamp) / 1000 / 3600;
            const speedKmh = timeInHours > 0 ? distance / timeInHours : 0;
            
            setCurrentSpeed(speedKmh);
            speedReadings.current.push(speedKmh);
            
            const avgSpeed = speedReadings.current.reduce((a, b) => a + b, 0) / speedReadings.current.length;
            setAverageSpeed(avgSpeed);

            // Enviar para Firebase apenas se estiver rastreando
            if (trackingGuid.current) {
              const trackerRef = collection(db, 'tracker');
              addDoc(trackerRef, {
                guid: trackingGuid.current,
                latitude,
                longitude,
                accuracy: positionAccuracy,
                speed: speedKmh,
                timestamp: Timestamp.fromDate(new Date()),
              }).catch(error => console.error('Erro ao salvar localização:', error));
            }
          }

          lastPosition.current = { latitude, longitude, timestamp: position.timestamp };
        },
        (error) => console.error('Erro de geolocalização:', error),
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [isTracking]); // Dependência em isTracking para reagir às mudanças de estado

  const startTracking = useCallback(() => {
    setIsTracking(true);
    trackingGuid.current = uuidv4();
    speedReadings.current = [];
    setCurrentSpeed(null);
    setAverageSpeed(null);
  }, []);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    trackingGuid.current = null;
    speedReadings.current = [];
    setCurrentSpeed(null);
    setAverageSpeed(null);
  }, []);

  return {
    isTracking,
    startTracking,
    stopTracking,
    currentLocation,
    currentSpeed,
    averageSpeed,
    accuracy
  };
}; 