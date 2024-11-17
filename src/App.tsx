import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Tracker } from './pages/Tracker';
import { SyncPage } from './pages/SyncPage';
import { TrackingProvider } from './contexts/TrackingContext';
import { SyncProvider } from './contexts/SyncContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';

export function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <SyncProvider>
            <TrackingProvider>
              <div className="App">
                {!isOnline && (
                  <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    textAlign: 'center',
                    padding: '8px',
                    zIndex: 9999
                  }}>
                    Você está offline. Usando versão em cache.
                  </div>
                )}
                <Header />
                <Routes>
                  <Route path="/" element={<Tracker />} />
                  <Route path="/sync" element={<SyncPage />} />
                </Routes>
              </div>
            </TrackingProvider>
          </SyncProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App; 