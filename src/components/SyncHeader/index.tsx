import { 
  ArrowPathIcon, // Substitui FaSync
  TrashIcon // Substitui FaTrash
} from '@heroicons/react/24/outline';
import styles from './styles.module.css';

interface SyncHeaderProps {
  onSync: () => void;
  onDeleteAll: () => void;
  isSyncing: boolean;
  isDeleting: boolean;
  unsyncedCount: number;
}

export function SyncHeader({ 
  onSync, 
  onDeleteAll, 
  isSyncing, 
  isDeleting,
  unsyncedCount 
}: SyncHeaderProps) {
  return (
    <div className={styles.header}>
      <button
        onClick={onSync}
        disabled={isSyncing || unsyncedCount === 0}
        className={`${styles.button} ${styles.syncButton}`}
      >
        <ArrowPathIcon className={isSyncing ? styles.rotating : ''} />
        {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
      </button>

      <button
        onClick={onDeleteAll}
        disabled={isDeleting || unsyncedCount === 0}
        className={`${styles.button} ${styles.deleteButton}`}
      >
        <TrashIcon />
        {isDeleting ? 'Excluindo...' : 'Excluir Todos'}
      </button>
    </div>
  );
} 