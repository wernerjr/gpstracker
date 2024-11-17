export const clearServiceWorkerDev = async () => {
  if (process.env.NODE_ENV === 'development') {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
      console.log('Service Workers removidos');
      
      // Limpa todos os caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('Caches limpos');
      
      window.location.reload();
    }
  }
}; 