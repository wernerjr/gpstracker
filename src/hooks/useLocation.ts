import { useState, useCallback, useEffect, useRef } from 'react';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';
import { db } from '../services/firebase';
import { v4 as uuidv4 } from 'uuid';

export const useLocation = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [trackingInterval, setTrackingInterval] = useState<NodeJS.Timer | null>(null);
  const [trackingGuid, setTrackingGuid] = useState<string | null>(null);
  
  // Novos estados
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState<number | null>(null);
  const [averageSpeed, setAverageSpeed] = useState<number | null>(null);
  const speedReadings = useRef<number[]>([]);

  // Adicionar useEffect para atualizar a média quando currentSpeed mudar
  useEffect(() => {
    if (currentSpeed !== null && isTracking) {
      speedReadings.current.push(currentSpeed);
      const average = speedReadings.current.reduce((a, b) => a + b, 0) / speedReadings.current.length;
      setAverageSpeed(average);
    }
  }, [currentSpeed, isTracking]);

  const startTracking = useCallback(() => {
    if (navigator.geolocation) {
      setIsTracking(true);
      const newGuid = uuidv4();
      setTrackingGuid(newGuid);
      
      // Resetar valores
      setCurrentLocation(null);
      setCurrentSpeed(null);
      setAverageSpeed(null);
      speedReadings.current = [];
      
      const trackerRef = collection(db, 'tracker');
      
      const intervalId = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude, speed } = position.coords;
            
            // Atualizar localização atual
            setCurrentLocation({ latitude, longitude });
            
            // Atualizar velocidade atual (convertendo m/s para km/h)
            const speedKmh = speed ? speed * 3.6 : 0;
            setCurrentSpeed(speedKmh);
            
            try {
              await addDoc(trackerRef, {
                guid: newGuid,
                latitude,
                longitude,
                speed: speedKmh,
                timestamp: Timestamp.fromDate(new Date()),
              });
            } catch (error) {
              console.error('Erro ao salvar localização:', error);
            }
          },
          (error) => console.error('Erro de geolocalização:', error),
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      }, 500);

      setTrackingInterval(intervalId);
    }
  }, []);

  const stopTracking = useCallback(() => {
    if (trackingInterval) {
      clearInterval(trackingInterval);
      setTrackingInterval(null);
      setIsTracking(false);
      setTrackingGuid(null);
      // Limpar outros estados
      //setCurrentLocation(null);
      //setCurrentSpeed(null);
      //setAverageSpeed(null);
      speedReadings.current = [];
    }
  }, [trackingInterval]);

  return {
    isTracking,
    startTracking,
    stopTracking,
    currentLocation,
    currentSpeed,
    averageSpeed
  };
}; 