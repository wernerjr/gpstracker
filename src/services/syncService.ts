import { collection, writeBatch, doc, Timestamp } from 'firebase/firestore';
import { firestore } from './firebase';
import { db } from './localDatabase';

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

      batches.push({
        batch,
        records: batchItems,
      });
    }

    for (const { batch, records } of batches) {
      await batch.commit();
      const ids = records.map(record => record.id!);
      await db.deleteRecords(ids);
    }

    return { 
      success: true, 
      syncedCount: unsynced.length 
    };

  } catch (error) {
    console.error('Erro na sincronização:', error);
    return { 
      success: false, 
      syncedCount: 0, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}; 