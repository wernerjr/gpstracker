import { ArrowPathIcon } from '@heroicons/react/24/solid';
import { SyncStatus } from './SyncStatus';

interface HeaderProps {
  unsyncedCount: number;
  onSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({ unsyncedCount, onSync }) => (
  <header style={{
    padding: '1rem',
    backgroundColor: '#2d2d2d',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #3498db',
  }}>
    <h1 style={{ margin: 0, fontSize: '1.5rem' }}>GPS Tracker</h1>
    <SyncStatus unsyncedCount={unsyncedCount} onSync={onSync} />
  </header>
); 