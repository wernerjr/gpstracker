export interface LocationData {
  latitude: number;
  longitude: number;
  speed: number;
  timestamp: number;
}

export interface LocationRecord extends LocationData {
  id?: number;
  guid: string;
  accuracy: number;
  synced: boolean;
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