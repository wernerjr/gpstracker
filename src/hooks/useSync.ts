import { useState, useCallback } from 'react';
import { db, LocationRecord } from '../services/localDatabase';
import { syncLocations } from '../services/syncService';

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);

  const getUnsyncedRecords = useCallback(async (): Promise<LocationRecord[]> => {
    try {
      return await db.getUnsynced();
    } catch (error) {
      console.error('Erro ao obter registros não sincronizados:', error);
      return [];
    }
  }, []);

  const syncData = useCallback(async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      const result = await syncLocations();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro na sincronização');
      }

      return result;
    } catch (error) {
      console.error('Erro na sincronização:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  return {
    isSyncing,
    syncData,
    getUnsyncedRecords,
  };
} 