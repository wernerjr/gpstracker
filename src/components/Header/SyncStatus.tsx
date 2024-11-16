import { ArrowPathIcon } from '@heroicons/react/24/solid';

interface SyncStatusProps {
  unsyncedCount: number;
  onSync: () => void;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ unsyncedCount, onSync }) => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center',
    gap: '0.5rem',
  }}>
    <span style={{ fontSize: '0.8rem' }}>
      {unsyncedCount 
        ? `${unsyncedCount} registros pendentes` 
        : 'Todos os dados sincronizados'}
    </span>
    <button 
      onClick={onSync}
      style={{
        background: 'none',
        border: 'none',
        padding: '0.5rem',
        cursor: 'pointer',
        color: '#3498db',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <ArrowPathIcon style={{ width: '20px', height: '20px' }} />
    </button>
  </div>
); 