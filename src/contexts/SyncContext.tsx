import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/localDatabase';

interface SyncContextData {
  unsyncedCount: number;
  updateUnsyncedCount: (count?: number) => void;
}

const SyncContext = createContext<SyncContextData>({} as SyncContextData);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [unsyncedCount, setUnsyncedCount] = useState(0);

  const updateUnsyncedCount = (count?: number) => {
    if (typeof count === 'number') {
      setUnsyncedCount(count);
    } else {
      setUnsyncedCount(prev => prev + 1);
    }
  };

  useEffect(() => {
    const checkUnsyncedRecords = () => {
      const records = JSON.parse(localStorage.getItem('unsyncedRecords') || '[]');
      setUnsyncedCount(records.length);
    };

    checkUnsyncedRecords();
    const interval = setInterval(checkUnsyncedRecords, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SyncContext.Provider value={{ unsyncedCount, updateUnsyncedCount }}>
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