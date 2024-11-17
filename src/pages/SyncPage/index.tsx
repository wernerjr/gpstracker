import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styled from 'styled-components';
import { TrashIcon, ArrowPathIcon, MapPinIcon, ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { db } from '../../services/localDatabase';
import type { LocationRecord } from '../../types/common';
import { syncLocations } from '../../services/syncService';
import { useSync } from '../../contexts/SyncContext';
import styles from './styles.module.css';
import { Button } from '../../components/Button';
import { EVENTS } from '../../utils/events';

// Extrair componentes menores
interface SyncHeaderProps {
  onSync: () => void;
  onDelete: () => void;
  isSyncing: boolean;
  isDeleting: boolean;
  hasRecords: boolean;
}

const SyncHeader: React.FC<SyncHeaderProps> = ({ 
  onSync, 
  onDelete, 
  isSyncing, 
  isDeleting, 
  hasRecords 
}) => (
  <div className={styles.header}>
    <h1 className={styles.title}>Sincronização</h1>
    <div className={styles.buttonGroup}>
      <Button 
        onClick={onSync} 
        disabled={isSyncing || !hasRecords}
        icon={
          <ArrowPathIcon 
            className={isSyncing ? styles.spinning : ''} 
            aria-hidden="true"
          />
        }
        variant="success"
      >
        <span className={styles.buttonText}>Sincronizar</span>
      </Button>

      <Button
        onClick={onDelete}
        disabled={isDeleting || !hasRecords}
        icon={<TrashIcon aria-hidden="true" />}
        variant="danger"
      >
        <span className={styles.buttonText}>Limpar</span>
      </Button>
    </div>
  </div>
);

// Usar hooks customizados para lógica de negócio
const useSyncManagement = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  
  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      // lógica de sincronização
    } finally {
      setIsSyncing(false);
    }
  };

  return { isSyncing, lastSync, handleSync };
};

export function SyncPage() {
  const [lastSync, setLastSync] = useState<string | null>(null);
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
      
      setUnsyncedRecords(prev => append ? [...prev, ...records] : records);
      setHasMore(records.length > 0 && unsyncedRecords.length < totalCount);
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore && !isLoading) {
      setCurrentPage(prev => prev + 1);
      loadUnsyncedRecords(currentPage + 1, true);
    }
  }, [hasMore, isLoading, currentPage]);

  useEffect(() => {
    loadUnsyncedRecords(1);
    loadLastSyncTime();
  }, []);

  useEffect(() => {
    const handleNewRecord = () => {
      loadUnsyncedRecords(1);
    };

    window.addEventListener(EVENTS.NEW_LOCATION_RECORD, handleNewRecord);

    return () => {
      window.removeEventListener(EVENTS.NEW_LOCATION_RECORD, handleNewRecord);
    };
  }, []);

  const loadLastSyncTime = () => {
    const lastSyncTime = localStorage.getItem('lastSyncTime');
    setLastSync(lastSyncTime);
  };

  const handleSync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      const result = await syncLocations();
      
      if (result.success) {
        const now = new Date().toISOString();
        localStorage.setItem('lastSyncTime', now);
        setLastSync(now);
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

  const handleDeleteUnsynced = async () => {
    if (!window.confirm('Tem certeza que deseja excluir todos os registros não sincronizados?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const records = await db.getUnsynced();
      const ids = records.map(record => record.id!);
      await db.deleteRecords(ids);
      await loadUnsyncedRecords(1);
      await updateUnsyncedCount();
    } catch (error) {
      console.error('Erro ao excluir registros:', error);
      alert('Erro ao excluir registros');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteRecord = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este registro?')) {
      return;
    }

    try {
      await db.deleteRecord(id);
      await loadUnsyncedRecords(1);
      await updateUnsyncedCount();
    } catch (error) {
      console.error('Erro ao excluir registro:', error);
      alert('Erro ao excluir registro');
    }
  };

  // Função auxiliar para formatar números com segurança
  const safeToFixed = (num: number | undefined | null, decimals: number = 2): string => {
    if (num === undefined || num === null) return '0';
    return num.toFixed(decimals);
  };

  const getAccuracyLabel = (accuracy: number) => {
    if (accuracy < 10) return 'Excelente';
    if (accuracy < 30) return 'Boa';
    return 'Inadequada';
  };

  const getAccuracyClass = (accuracy: number) => {
    if (accuracy < 10) return styles.accuracyLow;
    if (accuracy < 30) return styles.accuracyMedium;
    return styles.accuracyHigh;
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.content} onScroll={handleScroll}>
        <SyncHeader 
          onSync={handleSync} 
          onDelete={handleDeleteUnsynced} 
          isSyncing={isSyncing} 
          isDeleting={isDeleting} 
          hasRecords={unsyncedRecords.length > 0}
        />

        <div className={styles.syncCard}>
          <div className={styles.syncStatus}>
            {unsyncedRecords.length === 0 ? (
              <p className={styles.emptyMessage}>Nenhuma sincronização pendente</p>
            ) : (
              <>
                {unsyncedRecords.map((record, index) => (
                  <div key={record.id} className={styles.recordItem}>
                    <div className={styles.recordDetails}>
                      <div className={styles.detailItem}>
                        <MapPinIcon className={styles.icon} />
                        <span className={styles.label}>Localização:</span>
                        <span className={styles.value}>
                          {safeToFixed(record.latitude, 6)}, {safeToFixed(record.longitude, 6)}
                        </span>
                      </div>
                      
                      <div className={styles.detailItem}>
                        <ChartBarIcon className={styles.icon} />
                        <span className={styles.label}>Velocidade:</span>
                        <span className={styles.value}>
                          {safeToFixed(record.speed, 1)} km/h
                        </span>
                      </div>

                      <div className={styles.detailItem}>
                        <span className={styles.label}>Precisão:</span>
                        <span className={`${styles.value} ${getAccuracyClass(record.accuracy)}`}>
                          {safeToFixed(record.accuracy, 1)}m ({getAccuracyLabel(record.accuracy)})
                        </span>
                      </div>
                      
                      <div className={styles.detailItem}>
                        <ClockIcon className={styles.icon} />
                        <span className={styles.label}>Data:</span>
                        <span className={styles.value}>
                          {record.timestamp ? new Date(record.timestamp).toLocaleString() : '-'}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteRecord(record.id!)}
                      className={styles.deleteButton}
                      title="Excluir registro"
                    >
                      <TrashIcon className={styles.deleteIcon} />
                    </button>
                  </div>
                ))}
                
                {isLoading && (
                  <div className={styles.loadingMore}>
                    Carregando mais registros...
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 