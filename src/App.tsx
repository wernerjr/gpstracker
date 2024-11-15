import React from 'react';
import { LocationTracker } from './components/LocationTracker';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>GPS Tracker</h1>
        <LocationTracker />
      </header>
    </div>
  );
}

export default App; 