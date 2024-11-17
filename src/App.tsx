import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Tracker } from './pages/Tracker';
import { SyncPage } from './pages/SyncPage';
import { TrackingProvider } from './contexts/TrackingContext';
import { SyncProvider } from './contexts/SyncContext';

export function App() {
  return (
    <BrowserRouter>
      <SyncProvider>
        <TrackingProvider>
          <div className="App">
            <Header />
            <Routes>
              <Route path="/" element={<Tracker />} />
              <Route path="/sync" element={<SyncPage />} />
            </Routes>
          </div>
        </TrackingProvider>
      </SyncProvider>
    </BrowserRouter>
  );
}

export default App; 