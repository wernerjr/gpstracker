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
  const [trackingInterval, setTrackingInterval] = useState<NodeJS.Timer | null>(null);
  const [trackingGuid, setTrackingGuid] = useState<string | null>(null);
  
  // Novos estados
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState<number | null>(null);
  const [averageSpeed, setAverageSpeed] = useState<number | null>(null);
  const speedReadings = useRef<number[]>([]);
  const lastPosition = useRef<{latitude: number; longitude: number; timestamp: number} | null>(null);

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
      lastPosition.current = null;
      
      const trackerRef = collection(db, 'tracker');
      
      const intervalId = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const timestamp = position.timestamp;
            
            // Atualizar localização atual
            setCurrentLocation({ latitude, longitude });
            
            // Calcular velocidade usando a fórmula de Haversine
            if (lastPosition.current) {
              const distance = calculateDistance(
                lastPosition.current.latitude,
                lastPosition.current.longitude,
                latitude,
                longitude
              );
              const timeInHours = (timestamp - lastPosition.current.timestamp) / 1000 / 3600; // Converter ms para horas
              const speedKmh = timeInHours > 0 ? distance / timeInHours : 0;
              setCurrentSpeed(speedKmh);
            }
            
            // Atualizar última posição
            lastPosition.current = { latitude, longitude, timestamp };
            
            try {
              await addDoc(trackerRef, {
                guid: newGuid,
                latitude,
                longitude,
                speed: currentSpeed,
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