export interface Project {
  id?: number;
  clientId: number;
  clientName?: string;
  name: string;
  description?: string;
  address: string;
  city?: string;
  latitude: number;
  longitude: number;
  allowedRadiusMeters?: number;
  startDate?: string;
  estimatedEndDate?: string;
  actualEndDate?: string;
  status: ProjectStatus;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ProjectStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface ProjectFinancialSummary {
  projectId: number;
  projectName: string;
  totalBudgeted: number;
  totalInvoiced: number;
  totalCollected: number;
  pendingInvoicing: number;
  pendingCollection: number;
  invoicingPercentage: number;
  collectionPercentage: number;
}
