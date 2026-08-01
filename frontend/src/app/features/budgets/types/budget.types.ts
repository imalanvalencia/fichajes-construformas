export interface Budget {
  id?: number;
  projectId: number;
  projectName?: string;
  originalBudgetId?: number;
  version: number;
  budgetType: BudgetType;
  status: BudgetStatus;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  validUntil?: string;
  notes?: string;
  paymentTerms?: string;
  termsConditions?: string;
  createdById: number;
  createdByName?: string;
  approvedById?: number;
  approvedByName?: string;
  approvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type BudgetStatus = 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'SUPERSEDED';

export type BudgetType = 'ORIGINAL' | 'ANNEX' | 'VARIATION';

export interface BudgetItem {
  id?: number;
  budgetId?: number;
  zone?: string;
  description: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  orderNum: number;
  createdAt?: string;
}
