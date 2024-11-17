import { useState, useCallback } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

const UpdateButton = () => {
  const [isSpinning, setIsSpinning] = useState(false);

  const checkForUpdates = useCallback(async () => {
    if (isSpinning) return;

    setIsSpinning(true);
    
    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker não é suportado');
      }

      const registration = await navigator.serviceWorker.register('/service-worker.js');
      await registration.update();
      console.log('Service Worker atualizado');

    } catch (error) {
      console.error('Erro:', error);
    }
    
    // Aguarda 1 segundo antes de parar a animação
    setTimeout(() => {
      setIsSpinning(false);
    }, 1000);
    
  }, [isSpinning]);

  return (
    <button 
      onClick={checkForUpdates}
      disabled={isSpinning}
      title="Atualizar Service Worker"
      style={{
        background: 'transparent',
        border: 'none',
        padding: '4px',
        cursor: isSpinning ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isSpinning ? 0.5 : 0.7,
        transition: 'opacity 0.2s ease',
      }}
      onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
      onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
    >
      <ArrowPathIcon 
        style={{ 
          width: '16px', 
          height: '16px',
          color: '#fff',
          animation: isSpinning ? 'spin 1s linear' : 'none',
          // Garante que a animação pare na posição inicial
          transform: isSpinning ? undefined : 'rotate(0deg)'
        }} 
      />
    </button>
  );
};

export default UpdateButton; 