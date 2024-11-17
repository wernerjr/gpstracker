import { useState, useCallback, useEffect } from 'react';
import { useSync } from '../contexts/SyncContext';
import { db } from '../services/localDatabase';
import { syncLocations } from '../services/syncService';
import { LocationRecord } from '../types/common';
import { EVENTS } from '../utils/events';

export const useSyncManagement = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [unsyncedRecords, setUnsyncedRecords] = useState<LocationRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { updateUnsyncedCount } = useSync();

  const loadUnsyncedRecords = async (page: number, append: boolean = false) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const records = await db.getUnsynced(page);
      const totalCount = await db.getUnsyncedCount();
      
      setUnsyncedRecords(prev => {
        const newRecords = append ? [...prev, ...records] : records;
        return newRecords;
      });
      setHasMore(records.length > 0 && unsyncedRecords.length < totalCount);
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      const result = await syncLocations();
      
      if (result.success) {
        const now = new Date().toISOString();
        localStorage.setItem('lastSyncTime', now);
        await loadUnsyncedRecords(1);
        await updateUnsyncedCount();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erro na sincronização:', error);
      alert('Erro ao sincronizar: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setIsSyncing(false);
    }
  };

  const refreshRecords = useCallback(async () => {
    await loadUnsyncedRecords(1);
  }, []);

  useEffect(() => {
    const handleNewRecord = () => {
      refreshRecords();
    };

    window.addEventListener(EVENTS.NEW_LOCATION_RECORD, handleNewRecord);

    return () => {
      window.removeEventListener(EVENTS.NEW_LOCATION_RECORD, handleNewRecord);
    };
  }, [refreshRecords]);

  return {
    isSyncing,
    isDeleting,
    unsyncedRecords,
    hasMore,
    isLoading,
    currentPage,
    loadUnsyncedRecords,
    handleSync,
    setCurrentPage
  };
}; 