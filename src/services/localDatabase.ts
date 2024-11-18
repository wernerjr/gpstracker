import Dexie from 'dexie';
import type { LocationRecord } from '../types/common';

export type { LocationRecord };

class LocationDatabase extends Dexie {
  locations!: Dexie.Table<LocationRecord, number>;

  constructor() {
    super('LocationDatabase');
    this.version(1).stores({
      locations: '++id, guid, timestamp, synced'
    });
  }

  async addLocation(data: Omit<LocationRecord, 'id' | 'synced'>): Promise<number> {
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

  async getUnsynced(page: number = 1, limit: number = 20): Promise<LocationRecord[]> {
    const offset = (page - 1) * limit;
    return await this.locations
      .where('synced')
      .equals(0)
      .offset(offset)
      .limit(limit)
      .reverse()
      .toArray();
  }

  async getUnsyncedCount(): Promise<number> {
    return await this.locations
      .where('synced')
      .equals(0)
      .count();
  }

  async markAsSynced(ids: number[]): Promise<void> {
    await Promise.all(
      ids.map(id => 
        this.locations.update(id, { synced: 1 })
      )
    );
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

  async deleteRecord(id: number) {
    try {
      await this.locations.delete(id);
      console.log('Registro excluído com sucesso:', id);
    } catch (error) {
      console.error('Erro ao excluir registro:', error);
      throw error;
    }
  }

  async getAllUnsynced(): Promise<LocationRecord[]> {
    try {
      const records = await this.locations
        .where('synced')
        .equals(0)
        .toArray();
      
      console.log('Total de registros não sincronizados:', records.length);
      return records;
    } catch (error) {
      console.error('Erro ao obter todos os registros não sincronizados:', error);
      throw error;
    }
  }
}

export const db = new LocationDatabase(); 