import { useState, useCallback } from 'react';

const UpdateButton = () => {
  const [checking, setChecking] = useState(false);

  const checkForUpdates = useCallback(async () => {
    if (checking) return;

    try {
      setChecking(true);

      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker não é suportado');
      }

      // Registra o service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registrado com sucesso');

      // Força atualização
      await registration.update();
      console.log('Service Worker atualizado');

    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao verificar atualizações');
    } finally {
      setChecking(false);
    }
  }, [checking]);

  return (
    <button 
      onClick={checkForUpdates}
      disabled={checking}
      style={{
        padding: '8px 16px',
        backgroundColor: '#1976d2',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: checking ? 'not-allowed' : 'pointer'
      }}
    >
      {checking ? 'Verificando...' : 'Verificar Atualizações'}
    </button>
  );
};

export default UpdateButton; 