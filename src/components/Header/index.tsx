import { useNavigate, useLocation } from 'react-router-dom';
import { FaSatelliteDish, FaSync } from 'react-icons/fa';
import { useSync } from '../../contexts/SyncContext';
import styles from './styles.module.css';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unsyncedCount = 0 } = useSync();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <FaSatelliteDish className={styles.logoIcon} />
          <h1>GPS Tracker</h1>
        </div>

        <nav className={styles.nav}>
          <button
            className={`${styles.navButton} ${location.pathname === '/' ? styles.active : ''}`}
            onClick={() => navigate('/')}
          >
            <FaSatelliteDish className={styles.navIcon} />
            <span>Tracker</span>
          </button>
          
          <button
            className={`${styles.navButton} ${location.pathname === '/sync' ? styles.active : ''}`}
            onClick={() => navigate('/sync')}
          >
            <div className={styles.syncContainer}>
              <FaSync className={`${styles.navIcon} ${unsyncedCount > 0 ? styles.rotating : ''}`} />
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