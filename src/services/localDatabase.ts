import Dexie, { Table } from 'dexie';

export interface LocationRecord {
  id?: number;
  guid: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number | null;
  timestamp: Date;
  synced: 0 | 1;
}

class LocationDatabase extends Dexie {
  locations!: Table<LocationRecord>;

  constructor() {
    super('LocationDatabase');
    this.version(1).stores({
      locations: '++id, guid, synced, timestamp'
    });
  }

  async addLocation(record: Omit<LocationRecord, 'id' | 'synced'>) {
    console.log('Adicionando registro ao banco:', record);
    const id = await this.locations.add({
      ...record,
      synced: 0
    });
    console.log('Registro adicionado com ID:', id);
    return id;
  }

  async addLocations(records: Omit<LocationRecord, 'id' | 'synced'>[]) {
    return await this.locations.bulkAdd(
      records.map(record => ({
        ...record,
        synced: 0
      }))
    );
  }

  async getUnsynced(): Promise<LocationRecord[]> {
    const records = await this.locations
      .where('synced')
      .equals(0)
      .toArray();
    console.log('Registros não sincronizados:', records.length);
    return records;
  }

  async markAsSynced(ids: number[]) {
    await this.locations
      .where('id')
      .anyOf(ids)
      .modify({ synced: 1 });
  }
}

export const db = new LocationDatabase(); 