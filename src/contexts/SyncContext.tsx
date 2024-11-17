import React, { createContext, useContext, useState, useCallback } from 'react';
import { syncLocations } from '../services/syncService';
import { db } from '../services/localDatabase';

interface SyncContextData {
  unsyncedCount: number;
  updateUnsyncedCount: (count?: number) => void;
  isSyncing: boolean;
  syncData: () => Promise<{ success: boolean; syncedCount: number; error?: string }>;
  getUnsyncedRecords: () => Promise<any[]>;
}

const SyncContext = createContext<SyncContextData>({} as SyncContextData);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const updateUnsyncedCount = useCallback(async (count?: number) => {
    if (typeof count === 'number') {
      setUnsyncedCount(count);
    } else {
      const records = await db.getUnsynced();
      setUnsyncedCount(records.length);
    }
  }, []);

  const getUnsyncedRecords = useCallback(async () => {
    return await db.getUnsynced();
  }, []);

  const syncData = useCallback(async () => {
    if (isSyncing) return { success: false, syncedCount: 0, error: 'Sincronização em andamento' };

    setIsSyncing(true);
    try {
      const result = await syncLocations();
      await updateUnsyncedCount();
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, updateUnsyncedCount]);

  return (
    <SyncContext.Provider value={{ 
      unsyncedCount, 
      updateUnsyncedCount, 
      isSyncing, 
      syncData,
      getUnsyncedRecords 
    }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
} 