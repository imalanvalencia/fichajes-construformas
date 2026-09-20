export interface Payment {
  id?: number;
  invoiceId?: number;
  invoiceNumber?: string;
  projectId: number;
  projectName?: string;
  clientId: number;
  clientName?: string;
  paymentMethodId: number;
  paymentMethodName?: string;
  amount: number;
  paymentDate: string;
  reference?: string;
  type: PaymentType;
  notes?: string;
  createdById: number;
  createdByName?: string;
  createdAt?: string;
}

export type PaymentType = 'PHASE_1' | 'PHASE_2' | 'PHASE_3' | 'EXTRA' | 'INSURANCE';

export interface PaymentMethod {
  id?: number;
  name: string;
  active: boolean;
}
