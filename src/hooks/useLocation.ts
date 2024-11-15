import { useState, useCallback, useEffect } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';
import { db } from '../services/firebase';
import { v4 as uuidv4 } from 'uuid';

export const useLocation = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [trackingInterval, setTrackingInterval] = useState<NodeJS.Timer | null>(null);
  const [trackingGuid, setTrackingGuid] = useState<string | null>(null);

  const startTracking = useCallback(() => {
    if (navigator.geolocation) {
      setIsTracking(true);
      const newGuid = uuidv4();
      setTrackingGuid(newGuid);
      
      const trackerRef = collection(db, 'tracker');
      
      const intervalId = setInterval(() => {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            await addDoc(trackerRef, {
              guid: newGuid,
              latitude,
              longitude,
              timestamp: serverTimestamp(),
            });
          } catch (error) {
            console.error('Erro ao salvar localização:', error);
          }
        });
      }, 500);

      setTrackingInterval(intervalId);
    }
  }, []);

  const stopTracking = useCallback(() => {
    if (trackingInterval) {
      setIsTracking(false);
      setTrackingGuid(null);
      clearInterval(trackingInterval);
      setTrackingInterval(null);
    }
  }, [trackingInterval]);

  // Não esqueça de limpar o intervalo quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (trackingInterval) {
        clearInterval(trackingInterval);
      }
    };
  }, [trackingInterval]);

  return {
    isTracking,
    startTracking,
    stopTracking,
  };
}; 