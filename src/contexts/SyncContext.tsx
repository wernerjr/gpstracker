import { createContext, useContext, useState, useCallback } from 'react';

interface SyncContextData {
  unsyncedCount: number;
  syncData: () => Promise<void>;
  updateUnsyncedCount: () => void;
}

const SyncContext = createContext<SyncContextData>({} as SyncContextData);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [unsyncedCount, setUnsyncedCount] = useState(0);

  const updateUnsyncedCount = useCallback(() => {
    const records = JSON.parse(localStorage.getItem('locationRecords') || '[]');
    const unsynced = records.filter((record: any) => !record.synced);
    setUnsyncedCount(unsynced.length);
  }, []);

  const syncData = async () => {
    // sua lógica de sincronização
    updateUnsyncedCount();
  };

  return (
    <SyncContext.Provider value={{ 
      unsyncedCount, 
      syncData, 
      updateUnsyncedCount 
    }}>
      {children}
    </SyncContext.Provider>
  );
}

export const useSync = () => useContext(SyncContext); 