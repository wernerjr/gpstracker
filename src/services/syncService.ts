import { collection, writeBatch, doc, Timestamp } from 'firebase/firestore';
import { firestore } from './firebase';
import { db } from './localDatabase';

interface SyncResult {
  success: boolean;
  syncedCount: number;
  error?: string;
}

interface RetryOptions {
  retries: number;
  backoff: boolean;
  initialDelay?: number;
}

export class SyncError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'SyncError';
  }
}

// Função para esperar um tempo determinado
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Função de retry com backoff exponencial
const retryOperation = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions
): Promise<T> => {
  const { retries, backoff, initialDelay = 1000 } = options;
  let lastError: Error;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (i === retries - 1) break;
      
      // Calcula o delay com backoff exponencial
      const delayTime = backoff ? initialDelay * Math.pow(2, i) : initialDelay;
      await delay(delayTime);
    }
  }
  
  throw lastError!;
};

// Função para fazer upload das localizações
const uploadLocations = async (records: any[]): Promise<SyncResult> => {
  const BATCH_SIZE = 500;
  let totalSynced = 0;

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = writeBatch(firestore);
    const batchItems = records.slice(i, i + BATCH_SIZE);
    const trackerRef = collection(firestore, 'locations');

    batchItems.forEach(record => {
      const docRef = doc(trackerRef);
      batch.set(docRef, {
        guid: record.guid,
        latitude: record.latitude,
        longitude: record.longitude,
        accuracy: record.accuracy,
        speed: record.speed,
        timestamp: Timestamp.fromDate(new Date(record.timestamp)),
        createdAt: Timestamp.now()
      });
    });

    await batch.commit();
    const ids = batchItems.map(record => record.id!);
    await db.deleteRecords(ids);
    totalSynced += batchItems.length;
  }

  return {
    success: true,
    syncedCount: totalSynced
  };
};

export const syncLocations = async (): Promise<SyncResult> => {
  try {
    // Verificar conexão
    if (!navigator.onLine) {
      throw new SyncError('Sem conexão com internet', 'OFFLINE');
    }

    const unsynced = await db.getUnsynced();
    if (unsynced.length === 0) {
      return { success: true, syncedCount: 0 };
    }

    // Implementar retry com backoff exponencial
    const result = await retryOperation(
      () => uploadLocations(unsynced),
      {
        retries: 3,
        backoff: true,
        initialDelay: 1000
      }
    );

    return result;
  } catch (error) {
    console.error('Erro na sincronização:', error);
    if (error instanceof SyncError) {
      throw error;
    }
    throw new SyncError(
      'Erro ao sincronizar localizações',
      'SYNC_ERROR'
    );
  }
};