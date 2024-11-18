import { useNavigate, useLocation } from 'react-router-dom';
import { 
  SignalIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useSync } from '../../contexts/SyncContext';
import styles from './styles.module.css';
import UpdateButton from '../../components/UpdateButton';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unsyncedCount = 0 } = useSync();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <SignalIcon className={styles.logoIcon} />
          <h1>GPS Tracker</h1>
        </div>

        <nav className={styles.nav}>
          <button
            className={`${styles.navButton} ${location.pathname === '/' ? styles.active : ''}`}
            onClick={() => navigate('/')}
          >
            <SignalIcon className={styles.navIcon} />
            <span>Tracker</span>
          </button>         
          
          <button
            className={`${styles.navButton} ${location.pathname === '/sync' ? styles.active : ''}`}
            onClick={() => navigate('/sync')}
          >
            <div className={styles.syncContainer}>
              <ArrowPathIcon 
                className={`${styles.navIcon} ${unsyncedCount > 0 ? styles.rotating : ''}`}
              />
              {unsyncedCount > 0 && (
                <span className={styles.badge}>{unsyncedCount}</span>
              )}
            </div>
            <span>Sincronização</span>
          </button>
        </nav>
      </div>
    </header>
  );
} 