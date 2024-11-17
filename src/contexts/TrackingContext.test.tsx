import { render, renderHook, act } from '@testing-library/react';
import { TrackingProvider, useTracking } from './TrackingContext';
import { db } from '../services/localDatabase';
import React from 'react';
import { SyncProvider } from './SyncContext';

// Mocks
jest.mock('../services/localDatabase', () => ({
  db: {
    addLocation: jest.fn()
  }
}));

jest.mock('../services/firebase', () => ({
  // Mock vazio do firebase
}));

jest.mock('../services/syncService', () => ({
  // Mock vazio do syncService
}));

jest.mock('./SyncContext', () => ({
  ...jest.requireActual('./SyncContext'),
  useSync: () => ({
    syncStatus: 'idle',
    syncData: jest.fn(),
    lastSyncDate: null,
    updateUnsyncedCount: jest.fn()
  })
}));

describe('TrackingContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SyncProvider>
      <TrackingProvider>{children}</TrackingProvider>
    </SyncProvider>
  );

  it('deve fornecer o estado inicial correto', () => {
    const { result } = renderHook(() => useTracking(), { wrapper });

    expect(result.current.isTracking).toBe(false);
    expect(result.current.currentSpeed).toBe(0);
    expect(result.current.averageSpeed).toBe(0);
    expect(result.current.maxSpeed).toBe(0);
    expect(result.current.accuracy).toBe(null);
    expect(result.current.currentLocation).toBe(null);
    expect(typeof result.current.startTracking).toBe('function');
    expect(typeof result.current.stopTracking).toBe('function');
  });

  it('deve iniciar o rastreamento corretamente', async () => {
    const mockPosition = {
      coords: {
        latitude: -23.550520,
        longitude: -46.633308,
        speed: 10,
        accuracy: 8.5
      },
      timestamp: Date.now()
    };

    // Mock das permissões do navegador
    const mockPermissions = {
      query: jest.fn().mockResolvedValue({ state: 'granted' })
    };
    Object.defineProperty(navigator, 'permissions', {
      value: mockPermissions
    });

    // Mock do getCurrentPosition
    const mockGeolocation = {
      getCurrentPosition: jest.fn().mockImplementation(success => success(mockPosition)),
      watchPosition: jest.fn(),
      clearWatch: jest.fn()
    };
    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation
    });

    const { result } = renderHook(() => useTracking(), { wrapper });

    await act(async () => {
      await result.current.startTracking();
    });

    expect(result.current.isTracking).toBe(true);
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
  });

  it('deve parar o rastreamento corretamente', async () => {
    const { result } = renderHook(() => useTracking(), { wrapper });

    await act(async () => {
      await result.current.startTracking();
    });

    act(() => {
      result.current.stopTracking();
    });

    expect(result.current.isTracking).toBe(false);
  });

  it('deve atualizar a velocidade média corretamente', async () => {
    const mockPositions = [
      { 
        coords: { 
          speed: 10/3.6,
          latitude: 0, 
          longitude: 0, 
          accuracy: 5 
        }, 
        timestamp: Date.now() 
      },
      { 
        coords: { 
          speed: 20/3.6,
          latitude: 0, 
          longitude: 0, 
          accuracy: 5 
        }, 
        timestamp: Date.now() + 1000 
      }
    ];

    let positionCallback: (position: GeolocationPosition) => void;
    const mockGeolocation = {
      getCurrentPosition: jest.fn(),
      watchPosition: jest.fn((success) => {
        positionCallback = success;
        return 1;
      }),
      clearWatch: jest.fn()
    };

    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation
    });

    const { result } = renderHook(() => useTracking(), { wrapper });

    await act(async () => {
      await result.current.startTracking();
    });

    await act(async () => {
      positionCallback(mockPositions[0] as GeolocationPosition);
      positionCallback(mockPositions[1] as GeolocationPosition);
    });

    expect(result.current.averageSpeed).toBe(15);
  });

  it('deve lançar erro quando useTracking é usado fora do Provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Envolver em act() e usar wrapper: undefined para garantir que não há Provider
    expect(() => {
      renderHook(() => useTracking(), { wrapper: undefined });
    }).toThrow('useTracking must be used within a TrackingProvider');

    consoleSpy.mockRestore();
  });
});