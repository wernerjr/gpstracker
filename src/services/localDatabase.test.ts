import Dexie, { Table } from 'dexie';
import { db } from './localDatabase';
import type { LocationRecord } from '../types/common';

// Mock do Dexie
jest.mock('dexie', () => {
  const actualDexie = jest.requireActual('dexie');
  return {
    __esModule: true,
    default: class DexieMock extends actualDexie.default {
      locations!: Table<LocationRecord, number>;

      constructor() {
        super('TestDatabase');
        this.version(1).stores({
          locations: '++id, guid, timestamp, synced'
        });

        // Inicialização da tabela locations
        Object.defineProperty(this, 'locations', {
          value: {
            add: jest.fn(),
            bulkAdd: jest.fn(),
            where: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            bulkDelete: jest.fn()
          },
          writable: true
        });
      }
    }
  };
});

describe('LocalDatabase', () => {
  let mockData: Map<number, LocationRecord>;
  let currentId: number;

  beforeEach(() => {
    mockData = new Map();
    currentId = 1;

    // Mock das operações do Dexie com tipagem correta
    const mockTable = {
      add: jest.fn().mockImplementation((data: Partial<LocationRecord>) => {
        const id = currentId++;
        mockData.set(id, { ...data, id } as LocationRecord);
        return Promise.resolve(id);
      }),
      bulkAdd: jest.fn().mockImplementation((records: Partial<LocationRecord>[]) => {
        const ids = records.map(record => {
          const id = currentId++;
          mockData.set(id, { ...record, id } as LocationRecord);
          return id;
        });
        return Promise.resolve(ids);
      }),
      where: jest.fn().mockReturnValue({
        equals: jest.fn().mockReturnValue({
          offset: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              reverse: jest.fn().mockReturnValue({
                toArray: jest.fn().mockImplementation(() => {
                  return Promise.resolve(
                    Array.from(mockData.values())
                      .filter(record => record.synced === 0)
                  );
                })
              })
            })
          }),
          count: jest.fn().mockImplementation(() => {
            return Promise.resolve(
              Array.from(mockData.values())
                .filter(record => record.synced === 0)
                .length
            );
          })
        })
      }),
      update: jest.fn().mockImplementation((id: number, changes: Partial<LocationRecord>) => {
        const record = mockData.get(id);
        if (record) {
          mockData.set(id, { ...record, ...changes });
        }
        return Promise.resolve();
      }),
      delete: jest.fn().mockImplementation((id: number) => {
        mockData.delete(id);
        return Promise.resolve();
      }),
      bulkDelete: jest.fn().mockImplementation((ids: number[]) => {
        ids.forEach(id => mockData.delete(id));
        return Promise.resolve();
      })
    } as unknown as Table<LocationRecord, number>;

    // Atribuir o mock à propriedade locations
    Object.defineProperty(db, 'locations', {
      value: mockTable,
      configurable: true
    });
  });

  it('deve adicionar um novo registro corretamente', async () => {
    const mockLocation = {
      latitude: -23.550520,
      longitude: -46.633308,
      accuracy: 10,
      speed: 0,
      timestamp: Date.now(),
      guid: 'test-guid'
    };

    const id = await db.addLocation(mockLocation);
    expect(id).toBe(1);
    expect(mockData.get(id)).toEqual({
      ...mockLocation,
      id,
      synced: 0
    });
  });

  it('deve adicionar múltiplos registros corretamente', async () => {
    const mockLocations = [
      {
        latitude: -23.550520,
        longitude: -46.633308,
        accuracy: 10,
        speed: 0,
        timestamp: Date.now(),
        guid: 'test-guid-1'
      },
      {
        latitude: -23.550521,
        longitude: -46.633309,
        accuracy: 11,
        speed: 5,
        timestamp: Date.now(),
        guid: 'test-guid-2'
      }
    ];

    await db.addLocations(mockLocations);
    expect(mockData.size).toBe(2);
    expect(Array.from(mockData.values())).toEqual(
      expect.arrayContaining(
        mockLocations.map((loc, index) => ({
          ...loc,
          id: index + 1,
          synced: 0
        }))
      )
    );
  });

  it('deve obter registros não sincronizados corretamente', async () => {
    const mockLocations = [
      {
        id: 1,
        latitude: -23.550520,
        longitude: -46.633308,
        accuracy: 10,
        speed: 0,
        timestamp: Date.now(),
        guid: 'test-guid-1',
        synced: 0
      },
      {
        id: 2,
        latitude: -23.550521,
        longitude: -46.633309,
        accuracy: 11,
        speed: 5,
        timestamp: Date.now(),
        guid: 'test-guid-2',
        synced: 1
      }
    ];

    mockLocations.forEach(loc => mockData.set(loc.id, loc));
    const unsynced = await db.getUnsynced();
    expect(unsynced).toHaveLength(1);
    expect(unsynced[0]).toEqual(mockLocations[0]);
  });

  it('deve marcar registros como sincronizados corretamente', async () => {
    const ids = [1, 2];
    await db.markAsSynced(ids);
    expect(db.locations.update).toHaveBeenCalledTimes(2);
    ids.forEach(id => {
      expect(db.locations.update).toHaveBeenCalledWith(id, { synced: 1 });
    });
  });

  it('deve excluir um registro corretamente', async () => {
    const mockLocation = {
      id: 1,
      latitude: -23.550520,
      longitude: -46.633308,
      accuracy: 10,
      speed: 0,
      timestamp: Date.now(),
      guid: 'test-guid',
      synced: 0
    };

    mockData.set(mockLocation.id, mockLocation);
    await db.deleteRecord(1);
    expect(mockData.has(1)).toBeFalsy();
  });

  it('deve excluir múltiplos registros corretamente', async () => {
    const ids = [1, 2];
    ids.forEach(id => {
      mockData.set(id, {
        id,
        latitude: -23.550520,
        longitude: -46.633308,
        accuracy: 10,
        speed: 0,
        timestamp: Date.now(),
        guid: `test-guid-${id}`,
        synced: 0
      });
    });

    await db.deleteRecords(ids);
    expect(mockData.size).toBe(0);
    expect(db.locations.bulkDelete).toHaveBeenCalledWith(ids);
  });
});