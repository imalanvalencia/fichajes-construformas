export interface Project {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  allowedRadiusMeters: number;
  active: boolean;
}

export type ClockType = 'ENTRY' | 'EXIT';

export interface ClockEntryRequest {
  userId: number;
  projectId: number;
  clockType: ClockType;
  latitude: number;
  longitude: number;
  notes?: string;
}

export interface ClockEntry {
  id: number;
  user: { id: number; name: string };
  project: { id: number; name: string };
  clockType: ClockType;
  userLatitude: number;
  userLongitude: number;
  timestamp: string;
  notes?: string;
}
