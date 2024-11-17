export interface SyncRecord {
  id: number;
  guid: string;
  trackingId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed: number;
  timestamp: Date;
  synced: boolean;
}

export interface SyncState {
  isSyncing: boolean;
  isDeleting: boolean;
  unsyncedRecords: SyncRecord[];
  hasMore: boolean;
  isLoading: boolean;
  currentPage: number;
} 