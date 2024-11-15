import { useState, useCallback, useEffect } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Firestore } from 'firebase/firestore';
import { db } from '../services/firebase';
import { v4 as uuidv4 } from 'uuid';

interface WakeLockSentinel {
  released: boolean;
  release: () => Promise<void>;
}

interface WakeLock {
  request(type: 'screen'): Promise<WakeLockSentinel>;
}

interface NavigatorWithWakeLock extends Navigator {
  wakeLock: WakeLock;
}

export const useLocation = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [trackingInterval, setTrackingInterval] = useState<NodeJS.Timer | null>(null);
  const [trackingGuid, setTrackingGuid] = useState<string | null>(null);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

  const startTracking = useCallback(async () => {
    if (navigator.geolocation) {
      setIsTracking(true);
      const newGuid = uuidv4();
      setTrackingGuid(newGuid);
      
      // Solicita wake lock para manter a tela ativa
      try {
        const wakeLock = await (navigator as NavigatorWithWakeLock).wakeLock.request('screen');
        setWakeLock(wakeLock);
      } catch (err) {
        console.error('Wake Lock não suportado:', err);
      }
      
      const trackerRef = collection(db, 'tracker');
      
      const intervalId = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
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
      setIsTracking(false);
      setTrackingGuid(null);
      clearInterval(trackingInterval);
      setTrackingInterval(null);
      
      // Libera o wake lock
      if (wakeLock) {
        wakeLock.release();
        setWakeLock(null);
      }
    }
  }, [trackingInterval, wakeLock]);

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