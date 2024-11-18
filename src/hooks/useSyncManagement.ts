import { useState, useCallback, useEffect } from 'react';
import { useSync } from '../contexts/SyncContext';
import { db } from '../services/localDatabase';
import { syncLocations } from '../services/syncService';
import { LocationRecord } from '../types/common';
import { EVENTS } from '../utils/events';
import styles from '../pages/SyncPage/styles.module.css';
import { SyncResult } from '../types/sync';
import { useToast } from '../hooks/useToast';
import { ERROR_MESSAGES } from '../constants/messages';

interface SyncManagementReturn {
  unsyncedRecords: LocationRecord[];
  isSyncing: boolean;
  isDeleting: boolean;
  isLoading: boolean;
  hasMore: boolean;
  handleSync: () => Promise<SyncResult>;
  handleDeleteRecord: (id: number) => Promise<void>;
  handleDeleteUnsynced: () => Promise<void>;
  loadUnsyncedRecords: (page: number, append?: boolean) => Promise<void>;
  loadMoreRecords: () => void;
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

  const loadUnsyncedRecords = useCallback(async (page: number, append: boolean = false) => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const pageSize = 20;
      const records = await db.getUnsynced(page, pageSize);
      console.log(`Página ${page}: Carregados ${records.length} registros`);
      
      setUnsyncedRecords(prev => {
        if (append) {
          const existingIds = new Set(prev.map(r => r.id));
          const newRecords = records.filter(r => !existingIds.has(r.id));
          return [...prev, ...newRecords];
        }
        return records;
      });
      
      setHasMore(records.length === pageSize);
      setCurrentPage(page);
      
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
      showToast(
        `${ERROR_MESSAGES.LOAD_RECORDS_ERROR} ${error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR}`,
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

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

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    if (isLoading || !hasMore) {
      console.log('Scroll ignorado:', { isLoading, hasMore });
      return;
    }

    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    const threshold = scrollHeight - scrollTop - clientHeight;
    
    console.log('Scroll metrics:', { threshold, scrollTop, clientHeight, scrollHeight });

    if (threshold <= 50) {
      console.log('Carregando próxima página:', currentPage + 1);
      loadUnsyncedRecords(currentPage + 1, true);
    }
  }, [isLoading, hasMore, currentPage, loadUnsyncedRecords]);

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

  const loadMoreRecords = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    try {
      await loadUnsyncedRecords(currentPage + 1, true);
    } catch (error) {
      console.error('Erro ao carregar mais registros:', error);
      showToast(
        `${ERROR_MESSAGES.LOAD_RECORDS_ERROR} ${error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR}`,
        'error'
      );
    }
  }, [currentPage, isLoading, hasMore, loadUnsyncedRecords, showToast]);

  return {
    unsyncedRecords,
    isSyncing,
    isDeleting,
    isLoading,
    hasMore,
    handleSync,
    handleDeleteRecord,
    handleDeleteUnsynced,
    loadUnsyncedRecords,
    loadMoreRecords,
  };
}; 