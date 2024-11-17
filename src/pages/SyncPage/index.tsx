import { useState, useRef, useEffect } from 'react';
import { useSyncManagement } from '../../hooks/useSyncManagement';
import { Toast } from '../../components/Toast';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { ERROR_MESSAGES } from '../../constants/messages';
import styles from './styles.module.css';
import { SyncHeader } from '../../components/SyncHeader';
import { SyncRecord } from '../../components/SyncRecord';
import { FaSync, FaTrash } from 'react-icons/fa';

export function SyncPage() {
  const {
    unsyncedRecords,
    isSyncing,
    isDeleting,
    hasMore,
    handleSync,
    handleScroll,
    handleDeleteRecord,
    handleDeleteUnsynced,
    loadUnsyncedRecords,
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
    <div className={styles.container}>
      <div className={styles.syncHeader}>
        <button
          onClick={handleSyncWithToast}
          disabled={isSyncing || unsyncedRecords.length === 0}
          className={`${styles.button} ${styles.syncButton}`}
        >
          <FaSync className={isSyncing ? styles.rotating : ''} />
          Sincronizar
        </button>

        <button
          onClick={confirmDeleteAll}
          disabled={isDeleting || unsyncedRecords.length === 0}
          className={`${styles.button} ${styles.deleteButton}`}
        >
          <FaTrash />
          Excluir Todos
        </button>
      </div>

      <div className={styles.recordsContainer}>
        {unsyncedRecords.length > 0 ? (
          <div 
            className={styles.recordsList}
            onScroll={handleScroll}
            ref={containerRef}
          >
            {unsyncedRecords.map(record => (
              <SyncRecord
                key={record.id}
                record={record}
                onDelete={confirmDelete}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            Nenhum registro para sincronizar
          </div>
        )}
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