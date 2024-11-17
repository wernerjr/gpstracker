import { writeBatch, collection, doc, Timestamp } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { db } from './localDatabase';
import type { LocationRecord } from './localDatabase';
import type { SyncResult } from '../types/sync';

const uploadLocations = async (records: LocationRecord[]): Promise<SyncResult> => {
  const BATCH_SIZE = 500;
  let totalSynced = 0;
  let currentBatch: LocationRecord[] = [];
  let processedIds: number[] = [];

  try {
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = writeBatch(firestore);
      currentBatch = records.slice(i, i + BATCH_SIZE);
      const trackerRef = collection(firestore, 'locations');

      currentBatch.forEach(record => {
        if (!record.id) return;
        
        const docRef = doc(trackerRef);
        batch.set(docRef, {
          guid: record.guid,
          trackingId: record.trackingId,
          latitude: record.latitude,
          longitude: record.longitude,
          accuracy: record.accuracy,
          speed: record.speed,
          timestamp: Timestamp.fromDate(new Date(record.timestamp)),
          createdAt: Timestamp.now()
        });
        
        processedIds.push(record.id);
      });

      await batch.commit();
      
      if (processedIds.length > 0) {
        await db.deleteRecords(processedIds);
        totalSynced += processedIds.length;
        processedIds = [];
      }
    }

    return {
      success: true,
      syncedCount: totalSynced
    };
  } catch (error) {
    console.error('Erro no upload:', error);
    return {
      success: false,
      syncedCount: totalSynced,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
};

export const syncLocations = async (): Promise<SyncResult> => {
  try {
    if (!navigator.onLine) {
      return {
        success: false,
        syncedCount: 0,
        error: 'Sem conexão com internet'
      };
    }

    const unsynced = await db.getUnsynced();
    if (!unsynced || unsynced.length === 0) {
      return { 
        success: true, 
        syncedCount: 0 
      };
    }

    return await uploadLocations(unsynced);

  } catch (error) {
    console.error('Erro na sincronização:', error);
    return {
      success: false,
      syncedCount: 0,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
};