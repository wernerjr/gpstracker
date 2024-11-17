import { useState, useCallback } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import { useToast } from '../../hooks/useToast';
import styles from './styles.module.css';

const UpdateButton = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const { showToast } = useToast();

  const checkForUpdates = useCallback(async () => {
    if (isSpinning) return;

    setIsSpinning(true);
    
    try {
      if (!navigator.serviceWorker) {
        throw new Error('Service Worker não é suportado');
      }

      const registration = await navigator.serviceWorker.register('/service-worker.js');
      await registration.update();
      showToast('Aplicativo atualizado com sucesso!', 'success');

    } catch (error) {
      showToast(
        `Erro ao atualizar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        'error'
      );
    }
    
    setTimeout(() => {
      setIsSpinning(false);
    }, 1000);
    
  }, [isSpinning, showToast]);

  return (
    <button 
      onClick={checkForUpdates}
      className={styles.updateButton}
      disabled={isSpinning}
    >
      <ArrowPathIcon className={`${styles.icon} ${isSpinning ? styles.spinning : ''}`} />
    </button>
  );
};

export default UpdateButton; 