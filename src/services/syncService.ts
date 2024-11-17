import { collection, writeBatch, doc } from 'firebase/firestore';
import { firestore } from './firebase';
import { db } from './localDatabase';
import { LocationRecord, SyncResult } from '../types/common';
import { BATCH_SIZE } from '../constants';

const uploadLocations = async (records: LocationRecord[]): Promise<SyncResult> => {
  let syncedCount = 0;
  
  try {
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = writeBatch(firestore);
      const batchRecords = records.slice(i, i + BATCH_SIZE);
      
      for (const record of batchRecords) {
        const docRef = doc(collection(firestore, 'locations'));
        batch.set(docRef, {
          guid: record.guid,
          trackingId: record.trackingId || null,
          latitude: record.latitude,
          longitude: record.longitude,
          accuracy: record.accuracy,
          speed: record.speed,
          timestamp: record.timestamp
        });
      }

      await batch.commit();
      
      // Marcar registros como sincronizados
      const ids = batchRecords.map(r => r.id).filter((id): id is number => id !== undefined);
      await db.markAsSynced(ids);
      
      syncedCount += batchRecords.length;
    }

    return {
      success: true,
      syncedCount
    };
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return {
      success: false,
      syncedCount,
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