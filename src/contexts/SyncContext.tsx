import React, { createContext, useContext, useState, useCallback } from 'react';
import { syncLocations } from '../services/syncService';
import { db } from '../services/localDatabase';
import { SyncContextData, SyncResult } from '../types/common';

const SyncContext = createContext<SyncContextData | null>(null);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const updateUnsyncedCount = useCallback(async (count?: number) => {
    if (typeof count === 'number') {
      setUnsyncedCount(count);
    } else {
      const records = await db.getAllUnsynced();
      setUnsyncedCount(records.length);
    }
  }, []);

  const getUnsyncedRecords = useCallback(async () => {
    return await db.getAllUnsynced();
  }, []);

  const syncData = useCallback(async (): Promise<SyncResult> => {
    if (isSyncing) {
      return { 
        success: false, 
        syncedCount: 0, 
        error: 'Sincronização em andamento' 
      };
    }

    setIsSyncing(true);
    try {
      const result = await syncLocations();
      if (result.success) {
        await updateUnsyncedCount();
      }
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, updateUnsyncedCount]);

  const value = {
    unsyncedCount,
    updateUnsyncedCount,
    isSyncing,
    syncData,
    getUnsyncedRecords
  };

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync(): SyncContextData {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
} 