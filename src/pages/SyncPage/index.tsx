import { useState, useRef, useEffect } from 'react';
import { useSyncManagement } from '../../hooks/useSyncManagement';
import { Toast } from '../../components/Toast';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { ERROR_MESSAGES } from '../../constants/messages';
import styles from './styles.module.css';
import { SyncHeader } from '../../components/SyncHeader';
import { SyncRecord } from '../../components/SyncRecord';
import { FaSync, FaTrash } from 'react-icons/fa';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export function SyncPage() {
  const {
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
  } = useSyncManagement();

  const containerRef = useRef<HTMLDivElement>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    loadUnsyncedRecords(1);
  }, [loadUnsyncedRecords]);

  const handleDeleteWithToast = async (id: number) => {
    try {
      await handleDeleteRecord(id);
      setToast({
        message: "1 registro excluído com sucesso!",
        type: 'success',
        isVisible: true,
      });
    } catch (error) {
      setToast({
        message: `Erro ao excluir registro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        type: 'error',
        isVisible: true,
      });
    }
  };

  const handleDeleteAllWithToast = async () => {
    try {
      const count = unsyncedRecords.length;
      await handleDeleteUnsynced();
      setToast({
        message: `${count} registros excluídos com sucesso!`,
        type: 'success',
        isVisible: true,
      });
    } catch (error) {
      setToast({
        message: `Erro ao excluir registros: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        type: 'error',
        isVisible: true,
      });
    }
  };

  const handleDeleteSingleRecord = (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Registro',
      message: 'Tem certeza que deseja excluir este registro?',
      onConfirm: async () => {
        await handleDeleteWithToast(id);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const confirmDelete = (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Registro',
      message: ERROR_MESSAGES.DELETE_CONFIRMATION,
      onConfirm: () => {
        handleDeleteWithToast(id);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  const confirmDeleteAll = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Todos os Registros',
      message: ERROR_MESSAGES.DELETE_ALL_CONFIRMATION,
      onConfirm: () => {
        handleDeleteAllWithToast();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleSyncWithToast = async () => {
    try {
      const result = await handleSync();
      
      if (result.success) {
        setToast({
          message: `${result.syncedCount || 0} registros sincronizados com sucesso!`,
          type: 'success',
          isVisible: true,
        });
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      setToast({
        message: `Erro ao sincronizar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        type: 'error',
        isVisible: true,
      });
    }
  };

  return (
    <div className={styles.pageContainer}>
      <SyncHeader 
        onSync={handleSyncWithToast}
        onDeleteAll={confirmDeleteAll}
        isSyncing={isSyncing}
        isDeleting={isDeleting}
        unsyncedCount={unsyncedRecords.length}
      />

      <div className={styles.recordsContainer}>
        <div 
          ref={containerRef}
          className={styles.recordsList}
        >
          {unsyncedRecords.map(record => (
            <SyncRecord
              key={record.id}
              record={record}
              onDelete={handleDeleteSingleRecord}
            />
          ))}
          
          {unsyncedRecords.length > 0 && hasMore && !isLoading && (
            <div className={styles.loadMoreContainer}>
              <button 
                className={styles.loadMoreButton}
                onClick={loadMoreRecords}
                disabled={isLoading}
                aria-label="Carregar mais registros"
              >
                <ChevronDownIcon 
                  className={`${styles.loadMoreIcon} ${isLoading ? styles.spinning : ''}`}
                />
              </button>
            </div>
          )}

          {unsyncedRecords.length === 0 && !isLoading && (
            <div className={styles.emptyState}>
              Nenhum registro pendente de sincronização
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
} 