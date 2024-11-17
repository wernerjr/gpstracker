import { useState, useCallback, useEffect } from 'react';
import { useSync } from '../contexts/SyncContext';
import { db } from '../services/localDatabase';
import { syncLocations } from '../services/syncService';
import { LocationRecord } from '../types/common';
import { EVENTS } from '../utils/events';
import styles from '../pages/SyncPage/styles.module.css';
import { SyncResult } from '../types/sync';
import { useToast } from '../hooks/useToast';

interface SyncManagementReturn {
  unsyncedRecords: LocationRecord[];
  isSyncing: boolean;
  isDeleting: boolean;
  hasMore: boolean;
  currentPage: number;
  handleSync: () => Promise<SyncResult>;
  handleScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  handleDeleteRecord: (id: number) => Promise<void>;
  handleDeleteUnsynced: () => Promise<void>;
  loadUnsyncedRecords: (page: number, append?: boolean) => Promise<void>;
}

export const useSyncManagement = (): SyncManagementReturn => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [unsyncedRecords, setUnsyncedRecords] = useState<LocationRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { updateUnsyncedCount } = useSync();
  const { showToast } = useToast();

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

  const handleSync = async (): Promise<SyncResult> => {
    if (isSyncing) {
      showToast('Sincronização em andamento', 'error');
      return { success: false, error: 'Sincronização em andamento' };
    }

    setIsSyncing(true);
    try {
      const result = await syncLocations();
      
      if (result.success) {
        const now = new Date().toISOString();
        localStorage.setItem('lastSyncTime', now);
        await loadUnsyncedRecords(1);
        await updateUnsyncedCount();
        showToast(`${result.syncedCount} registros sincronizados com sucesso!`, 'success');
      } else {
        showToast(`Erro na sincronização: ${result.error}`, 'error');
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      showToast(`Erro na sincronização: ${errorMessage}`, 'error');
      return {
        success: false,
        error: errorMessage
      };
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

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (isLoading || !hasMore) return;

    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      setCurrentPage(prev => prev + 1);
      loadUnsyncedRecords(currentPage + 1, true);
    }
  };

  const handleDeleteRecord = useCallback(async (id: number) => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await db.deleteRecord(id);
      await loadUnsyncedRecords(1);
      await updateUnsyncedCount();
      showToast('Registro excluído com sucesso!', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      showToast(`Erro ao excluir registro: ${errorMessage}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleting, loadUnsyncedRecords, updateUnsyncedCount, showToast]);

  const handleDeleteUnsynced = useCallback(async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      const records = await db.getUnsynced();
      const ids = records.map(r => r.id).filter((id): id is number => id !== undefined);
      await db.deleteRecords(ids);
      await loadUnsyncedRecords(1);
      await updateUnsyncedCount();
      showToast('Registros excluídos com sucesso!', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      showToast(`Erro ao excluir registros: ${errorMessage}`, 'error');
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleting, loadUnsyncedRecords, updateUnsyncedCount, showToast]);

  return {
    unsyncedRecords,
    isSyncing,
    isDeleting,
    hasMore,
    currentPage,
    handleSync,
    handleScroll,
    handleDeleteRecord,
    handleDeleteUnsynced,
    loadUnsyncedRecords,
  };
}; 