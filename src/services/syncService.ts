import { db } from './localDatabase';
import { 
  collection, 
  writeBatch, 
  Timestamp, 
  doc, 
  DocumentReference,
  CollectionReference 
} from 'firebase/firestore';
import { db as firestore } from './firebase';

const BATCH_SIZE = 500;

export const syncLocations = async (): Promise<{
  success: boolean;
  syncedCount: number;
  error?: string;
}> => {
  try {
    const unsynced = await db.getUnsynced();
    if (unsynced.length === 0) {
      return { success: true, syncedCount: 0 };
    }

    const batches = [];
    for (let i = 0; i < unsynced.length; i += BATCH_SIZE) {
      const batch = writeBatch(firestore);
      const batchItems = unsynced.slice(i, i + BATCH_SIZE);
      const trackerRef = collection(firestore, 'tracker');

      batchItems.forEach(record => {
        const docRef = doc(trackerRef);
        batch.set(docRef, {
          guid: record.guid,
          latitude: record.latitude,
          longitude: record.longitude,
          accuracy: record.accuracy,
          speed: record.speed,
          timestamp: Timestamp.fromDate(record.timestamp),
        });
      });

      batches.push({
        batch,
        ids: batchItems.map(item => item.id!),
      });
    }

    // Executar todos os batches
    for (const { batch, ids } of batches) {
      await batch.commit();
      await db.markAsSynced(ids);
    }

    return {
      success: true,
      syncedCount: unsynced.length,
    };
  } catch (error) {
    console.error('Erro na sincronização:', error);
    return {
      success: false,
      syncedCount: 0,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}; 