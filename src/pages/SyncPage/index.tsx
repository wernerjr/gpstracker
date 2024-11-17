import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styled from 'styled-components';
import { TrashIcon, ArrowPathIcon, MapPinIcon, ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { db, LocationRecord } from '../../services/localDatabase';
import { syncLocations } from '../../services/syncService';
import { useSync } from '../../contexts/SyncContext';
import styles from './styles.module.css';

export function SyncPage() {
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [unsyncedRecords, setUnsyncedRecords] = useState<LocationRecord[]>([]);
  const { updateUnsyncedCount } = useSync();

  // Carrega os registros ao montar o componente e após cada operação
  useEffect(() => {
    loadUnsyncedRecords();
    loadLastSyncTime();
  }, []);

  const loadUnsyncedRecords = async () => {
    try {
      console.log('Carregando registros não sincronizados...');
      const records = await db.getUnsynced();
      console.log('Registros encontrados:', records.length);
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
      console.log('Iniciando sincronização...');
      const result = await syncLocations();
      
      if (result.success) {
        console.log(`${result.syncedCount} registros sincronizados com sucesso`);
        const now = new Date().toISOString();
        localStorage.setItem('lastSyncTime', now);
        setLastSync(now);
        
        // Recarrega a lista de registros
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

  // Pega o registro mais recente para exibição
  const latestRecord = unsyncedRecords[0];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Sincronização</h1>
          <div className={styles.buttonGroup}>
            <button 
              onClick={handleSync} 
              disabled={isSyncing || unsyncedRecords.length === 0}
              className={styles.syncButton}
            >
              <ArrowPathIcon className={`${styles.icon} ${isSyncing ? styles.spinning : ''}`} />
              Sincronizar Agora
            </button>
            
            <button
              onClick={handleDeleteUnsynced}
              disabled={isDeleting || unsyncedRecords.length === 0}
              className={styles.deleteButton}
            >
              <TrashIcon className={styles.icon} />
              Excluir Registros
            </button>
          </div>
        </div>

        <div className={styles.syncCard}>
          <div className={styles.syncStatus}>
            {unsyncedRecords.length === 0 ? (
              <p className={styles.emptyMessage}>Nenhuma sincronização pendente</p>
            ) : (
              <div className={styles.recordDetails}>
                <div className={styles.detailItem}>
                  <MapPinIcon className={styles.icon} />
                  <span className={styles.label}>Localização:</span>
                  <span className={styles.value}>
                    {latestRecord?.latitude.toFixed(6)}, {latestRecord?.longitude.toFixed(6)}
                  </span>
                </div>
                
                <div className={styles.detailItem}>
                  <ChartBarIcon className={styles.icon} />
                  <span className={styles.label}>Velocidade:</span>
                  <span className={styles.value}>{latestRecord?.speed.toFixed(1)} km/h</span>
                </div>
                
                <div className={styles.detailItem}>
                  <ClockIcon className={styles.icon} />
                  <span className={styles.label}>Data:</span>
                  <span className={styles.value}>
                    {latestRecord?.timestamp ? new Date(latestRecord.timestamp).toLocaleString() : '-'}
                  </span>
                </div>

                {unsyncedRecords.length > 1 && (
                  <p className={styles.pendingCount}>
                    + {unsyncedRecords.length - 1} {unsyncedRecords.length - 1 === 1 ? 'registro pendente' : 'registros pendentes'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 