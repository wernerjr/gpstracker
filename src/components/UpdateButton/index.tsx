import { useState, useCallback } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/solid';
import { Toast } from '../Toast';
import { useToast } from '../../hooks/useToast';

const UpdateButton = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const checkForUpdates = useCallback(async () => {
    if (isSpinning) return;

    setIsSpinning(true);
    
    try {
      if (!('serviceWorker' in navigator)) {
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
    <>
      <button 
        onClick={checkForUpdates}
        disabled={isSpinning}
        title="Atualizar Service Worker"
        style={{
          background: 'transparent',
          border: 'none',
          padding: '4px',
          cursor: 'pointer',
          color: 'white',
        }}
      >
        <ArrowPathIcon 
          style={{
            width: '20px',
            height: '20px',
            animation: isSpinning ? 'rotate 1s linear infinite' : 'none'
          }}
        />
      </button>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </>
  );
};

export default UpdateButton; 