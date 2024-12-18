export interface LocationData {
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: number;
}

export interface LocationRecord extends LocationData {
  id?: number;
  guid: string;
  trackingId?: string;
  accuracy: number;
  synced: number;
}

export interface TrackingContextData {
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  currentSpeed: number;
  averageSpeed: number;
  maxSpeed: number;
  accuracy: number | null;
  currentLocation: LocationData | null;
}

export interface SyncContextData {
  unsyncedCount: number;
  updateUnsyncedCount: (count?: number) => void;
  isSyncing: boolean;
  syncData: () => Promise<SyncResult>;
  getUnsyncedRecords: () => Promise<LocationRecord[]>;
}

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  error?: string;
}

export interface SyncManagementReturn {
  unsyncedRecords: LocationRecord[];
  isSyncing: boolean;
  isDeleting: boolean;
  isLoading: boolean;
  hasMore: boolean;
  handleSync: () => Promise<SyncResult>;
  handleDeleteRecord: (id: number) => Promise<void>;
  handleDeleteUnsynced: () => Promise<void>;
  loadUnsyncedRecords: (page: number, append?: boolean) => Promise<void>;
  loadMoreRecords: () => void;
} 