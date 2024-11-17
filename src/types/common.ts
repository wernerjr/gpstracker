export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number;
  timestamp: number;
}

export interface LocationRecord extends LocationData {
  id?: number;
  guid: string;
  synced?: number;
  trackingId?: string;
}

export interface SyncResult {
  success: boolean;
  syncedCount?: number;
  error?: string;
}

export interface SyncContextData {
  unsyncedCount: number;
  isSyncing: boolean;
  updateUnsyncedCount: (count?: number) => Promise<void>;
  syncData: () => Promise<SyncResult>;
  getUnsyncedRecords: () => Promise<LocationRecord[]>;
} 