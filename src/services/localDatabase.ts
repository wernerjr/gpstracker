import Dexie, { Table } from 'dexie';

export interface LocationRecord {
  id?: number;
  guid: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number | null;
  timestamp: Date;
  synced: number;
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
    return await this.locations.add({
      ...record,
      synced: 0
    });
  }

  async getUnsynced(): Promise<LocationRecord[]> {
    return await this.locations
      .where('synced')
      .equals(0)
      .toArray();
  }

  async markAsSynced(ids: number[]) {
    await this.locations
      .where('id')
      .anyOf(ids)
      .modify({ synced: 1 });
  }
}

export const db = new LocationDatabase(); 