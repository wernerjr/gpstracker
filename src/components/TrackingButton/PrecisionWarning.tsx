import { ExclamationCircleIcon } from '@heroicons/react/24/solid';

export const PrecisionWarning: React.FC = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#e74c3c',
    fontSize: '0.9rem',
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderRadius: '8px',
    width: '100%',
  }}>
    <ExclamationCircleIcon style={{ width: '20px', height: '20px', padding: '0.75rem', }} />
    <span>Aguardando precisão do GPS melhorar para iniciar...</span>
  </div>
); 