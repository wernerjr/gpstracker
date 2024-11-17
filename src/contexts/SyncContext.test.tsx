import { renderHook, act } from '@testing-library/react';
import { SyncProvider, useSync } from './SyncContext';
import { db } from '../services/localDatabase';
import { syncLocations } from '../services/syncService';
import React from 'react';

// Mocks
jest.mock('../services/localDatabase', () => ({
  db: {
    getUnsynced: jest.fn()
  }
}));

jest.mock('../services/syncService', () => ({
  syncLocations: jest.fn()
}));

describe('SyncContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SyncProvider>{children}</SyncProvider>
  );

  it('deve fornecer o estado inicial correto', async () => {
    const { result } = renderHook(() => useSync(), { wrapper });

    expect(result.current.unsyncedCount).toBe(0);
    expect(result.current.isSyncing).toBe(false);
    expect(typeof result.current.updateUnsyncedCount).toBe('function');
    expect(typeof result.current.syncData).toBe('function');
    expect(typeof result.current.getUnsyncedRecords).toBe('function');
  });

  it('deve atualizar unsyncedCount corretamente', async () => {
    const mockRecords = [{ id: 1 }, { id: 2 }];
    (db.getUnsynced as jest.Mock).mockResolvedValue(mockRecords);

    const { result } = renderHook(() => useSync(), { wrapper });

    await act(async () => {
      await result.current.updateUnsyncedCount();
    });

    expect(result.current.unsyncedCount).toBe(2);
  });

  it('deve sincronizar dados corretamente', async () => {
    const mockSyncResult = { success: true, syncedCount: 5 };
    (syncLocations as jest.Mock).mockResolvedValue(mockSyncResult);

    const { result } = renderHook(() => useSync(), { wrapper });

    let syncResult;
    await act(async () => {
      syncResult = await result.current.syncData();
    });

    expect(syncResult).toEqual(mockSyncResult);
    expect(result.current.isSyncing).toBe(false);
  });

  it('não deve permitir sincronização simultânea', async () => {
    const mockSyncResult = { success: true, syncedCount: 5 };
    (syncLocations as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockSyncResult), 100))
    );

    const { result } = renderHook(() => useSync(), { wrapper });

    // Inicia primeira sincronização
    const firstSyncPromise = result.current.syncData();

    // Tenta segunda sincronização imediatamente
    const secondSyncResult = await result.current.syncData();

    expect(secondSyncResult).toEqual({
      success: false,
      syncedCount: 0,
      error: 'Sincronização em andamento'
    });

    // Aguarda primeira sincronização terminar
    await firstSyncPromise;
  });

  it('deve obter registros não sincronizados corretamente', async () => {
    const mockRecords = [{ id: 1 }, { id: 2 }];
    (db.getUnsynced as jest.Mock).mockResolvedValue(mockRecords);

    const { result } = renderHook(() => useSync(), { wrapper });

    let records;
    await act(async () => {
      records = await result.current.getUnsyncedRecords();
    });

    expect(records).toEqual(mockRecords);
  });

  it('deve lançar erro quando useSync é usado fora do Provider', () => {
    // Silencia os erros do console durante o teste
    const consoleSpy = jest.spyOn(console, 'error');
    consoleSpy.mockImplementation(() => {});

    try {
      renderHook(() => useSync());
      fail('Deveria ter lançado um erro');
    } catch (error: unknown) {
      if (error instanceof Error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('useSync must be used within a SyncProvider');
      } else {
        fail('Erro deveria ser uma instância de Error');
      }
    }

    consoleSpy.mockRestore();
  });
}); 