import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { LocationTracker } from './pages/LocationTracker';
import { SyncPage } from './pages/SyncPage';

function App() {
  const [unsyncedCount, setUnsyncedCount] = useState(0);

  useEffect(() => {
    const updateUnsyncedCount = () => {
      const records = JSON.parse(localStorage.getItem('locationRecords') || '[]');
      const unsynced = records.filter((record: any) => !record.synced);
      setUnsyncedCount(unsynced.length);
    };

    updateUnsyncedCount();
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Header unsyncedCount={unsyncedCount} />
        <Routes>
          <Route path="/" element={<LocationTracker />} />
          <Route path="/sync" element={<SyncPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App; 