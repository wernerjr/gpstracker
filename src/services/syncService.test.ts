import { syncLocations } from './syncService';
import { db } from './localDatabase';
import { firestore } from './firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import type { LocationRecord } from '../types/common';

// Mocks
jest.mock('./firebase', () => ({
  firestore: {}
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  writeBatch: jest.fn(),
  doc: jest.fn()
}));

jest.mock('./localDatabase', () => ({
  db: {
    getUnsynced: jest.fn(),
    markAsSynced: jest.fn()
  }
}));

describe('syncService', () => {
  let mockBatch: { set: jest.Mock; commit: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock do batch do Firestore
    mockBatch = {
      set: jest.fn(),
      commit: jest.fn().mockResolvedValue(undefined)
    };
    
    (writeBatch as jest.Mock).mockReturnValue(mockBatch);
    (collection as jest.Mock).mockReturnValue({});
    (doc as jest.Mock).mockReturnValue({});

    // Mock do navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true
    });
  });

  it('deve retornar sucesso quando não há registros para sincronizar', async () => {
    (db.getUnsynced as jest.Mock).mockResolvedValue([]);

    const result = await syncLocations();

    expect(result).toEqual({
      success: true,
      syncedCount: 0
    });
    expect(writeBatch).not.toHaveBeenCalled();
  });

  it('deve sincronizar registros corretamente', async () => {
    const mockRecords: LocationRecord[] = [
      {
        id: 1,
        guid: 'test-guid-1',
        trackingId: 'track-1',
        latitude: -23.550520,
        longitude: -46.633308,
        accuracy: 10,
        speed: 0,
        timestamp: Date.now(),
        synced: 0
      },
      {
        id: 2,
        guid: 'test-guid-2',
        trackingId: 'track-2',
        latitude: -23.550521,
        longitude: -46.633309,
        accuracy: 11,
        speed: 5,
        timestamp: Date.now(),
        synced: 0
      }
    ];

    (db.getUnsynced as jest.Mock).mockResolvedValue(mockRecords);

    const result = await syncLocations();

    expect(result).toEqual({
      success: true,
      syncedCount: 2
    });
    expect(mockBatch.set).toHaveBeenCalledTimes(2);
    expect(db.markAsSynced).toHaveBeenCalledWith([1, 2]);
  });

  it('deve retornar erro quando offline', async () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false
    });

    const result = await syncLocations();

    expect(result).toEqual({
      success: false,
      syncedCount: 0,
      error: 'Sem conexão com internet'
    });
    expect(db.getUnsynced).not.toHaveBeenCalled();
  });

  it('deve lidar com erros durante o upload', async () => {
    const mockError = new Error('Erro no Firestore');
    mockBatch.commit.mockRejectedValue(mockError);

    const mockRecords: LocationRecord[] = [{
      id: 1,
      guid: 'test-guid',
      trackingId: 'track-1',
      latitude: -23.550520,
      longitude: -46.633308,
      accuracy: 10,
      speed: 0,
      timestamp: Date.now(),
      synced: 0
    }];

    (db.getUnsynced as jest.Mock).mockResolvedValue(mockRecords);

    const result = await syncLocations();

    expect(result).toEqual({
      success: false,
      syncedCount: 0,
      error: 'Erro no Firestore'
    });
  });

  it('deve processar registros em lotes quando excede o tamanho do batch', async () => {
    const mockRecords: LocationRecord[] = Array(550).fill(null).map((_, index) => ({
      id: index + 1,
      guid: `test-guid-${index}`,
      trackingId: `track-${index}`,
      latitude: -23.550520,
      longitude: -46.633308,
      accuracy: 10,
      speed: 0,
      timestamp: Date.now(),
      synced: 0
    }));

    (db.getUnsynced as jest.Mock).mockResolvedValue(mockRecords);

    const result = await syncLocations();

    expect(result).toEqual({
      success: true,
      syncedCount: 550
    });
    // Considerando BATCH_SIZE = 500
    expect(mockBatch.commit).toHaveBeenCalledTimes(2);
  });
});