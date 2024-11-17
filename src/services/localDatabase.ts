import Dexie, { Table } from 'dexie';

export interface LocationRecord {
  id?: number;
  guid: string;
  trackingId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number;
  timestamp: Date;
  synced?: number;
}

class LocationDatabase extends Dexie {
  locations!: Table<LocationRecord>;

  constructor() {
    super('LocationDatabase');
    this.version(2).stores({
      locations: '++id, guid, trackingId, synced, timestamp'
    });
  }

  async addLocation(data: Omit<LocationRecord, 'id' | 'synced'>) {
    return await this.locations.add({
      ...data,
      synced: 0
    });
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

  async deleteRecords(ids: number[]) {
    try {
      console.log('Excluindo registros:', ids);
      await this.locations.bulkDelete(ids);
      console.log('Registros excluídos com sucesso');
    } catch (error) {
      console.error('Erro ao excluir registros:', error);
      throw error;
    }
  }

  async clearDatabase() {
    try {
      await this.locations.clear();
      console.log('Banco de dados limpo com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao limpar banco de dados:', error);
      throw error;
    }
  }
}

export const db = new LocationDatabase(); 