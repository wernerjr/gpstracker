export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface LocationRecord extends LocationData {
  id?: number;
  guid: string;
  accuracy: number;
  speed: number;
  timestamp: Date;
  synced?: number;
} 