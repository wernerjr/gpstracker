import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styled from 'styled-components';
import { TrashIcon, ArrowPathIcon, MapPinIcon, ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { db, LocationRecord } from '../../services/localDatabase';
import { syncLocations } from '../../services/syncService';
import { useSync } from '../../contexts/SyncContext';
import styles from './styles.module.css';
import { Button } from '../../components/Button';

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
        icon={<ArrowPathIcon />}
        variant="success"
      >
        Sincronizar
      </Button>
      <Button
        onClick={onDelete}
        disabled={isDeleting || !hasRecords}
        icon={<TrashIcon />}
        variant="danger"
      >
        Limpar
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
  const { updateUnsyncedCount } = useSync();

  useEffect(() => {
    loadUnsyncedRecords();
    loadLastSyncTime();
  }, []);

  const loadUnsyncedRecords = async () => {
    try {
      const records = await db.getUnsynced();
      setUnsyncedRecords(records);
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
    }
  };

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
        await loadUnsyncedRecords();
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
      await loadUnsyncedRecords();
      await updateUnsyncedCount();
    } catch (error) {
      console.error('Erro ao excluir registros:', error);
      alert('Erro ao excluir registros');
    } finally {
      setIsDeleting(false);
    }
  };

  const latestRecord = unsyncedRecords[0];

  // Função auxiliar para formatar números com segurança
  const safeToFixed = (num: number | undefined | null, decimals: number = 2): string => {
    if (num === undefined || num === null) return '0';
    return num.toFixed(decimals);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.content}>
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
            ) : latestRecord ? (
              <div className={styles.recordDetails}>
                <div className={styles.detailItem}>
                  <MapPinIcon className={styles.icon} />
                  <span className={styles.label}>Localização:</span>
                  <span className={styles.value}>
                    {safeToFixed(latestRecord?.latitude, 6)}, {safeToFixed(latestRecord?.longitude, 6)}
                  </span>
                </div>
                
                <div className={styles.detailItem}>
                  <ChartBarIcon className={styles.icon} />
                  <span className={styles.label}>Velocidade:</span>
                  <span className={styles.value}>
                    {safeToFixed(latestRecord?.speed, 1)} km/h
                  </span>
                </div>
                
                <div className={styles.detailItem}>
                  <ClockIcon className={styles.icon} />
                  <span className={styles.label}>Data:</span>
                  <span className={styles.value}>
                    {latestRecord?.timestamp 
                      ? new Date(latestRecord.timestamp).toLocaleString() 
                      : '-'}
                  </span>
                </div>

                {unsyncedRecords.length > 1 && (
                  <p className={styles.pendingCount}>
                    + {unsyncedRecords.length - 1} {unsyncedRecords.length - 1 === 1 ? 'registro pendente' : 'registros pendentes'}
                  </p>
                )}
              </div>
            ) : (
              <p className={styles.emptyMessage}>Erro ao carregar dados</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 