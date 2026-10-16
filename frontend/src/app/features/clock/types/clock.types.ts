export interface ClockEntry {
  id?: number;
  /** Omitted on create: the server clocks in the authenticated user. */
  userId?: number;
  userName?: string;
  projectId: number;
  projectName?: string;
  clockType: ClockType;
  userLatitude: number;
  userLongitude: number;
  /** Omitted on create: the server stamps the time. */
  timestamp?: string;
  notes?: string;
}

export type ClockType = 'ENTRY' | 'EXIT';

export type CorrectionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ClockCorrection {
  id?: number;
  userId?: number;
  userName?: string;
  projectId: number;
  projectName?: string;
  originalEntryId?: number;
  correctionDate: string;
  originalClockType: ClockType;
  correctedTime: string;
  reason: string;
  status?: CorrectionStatus;
  reviewedById?: number;
  reviewedByName?: string;
  reviewedAt?: string;
  createdAt?: string;
}
