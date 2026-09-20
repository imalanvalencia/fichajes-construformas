export interface ClockEntry {
  id?: number;
  userId: number;
  userName?: string;
  projectId: number;
  projectName?: string;
  clockType: ClockType;
  userLatitude: number;
  userLongitude: number;
  timestamp: string;
  notes?: string;
}

export type ClockType = 'ENTRY' | 'EXIT';
