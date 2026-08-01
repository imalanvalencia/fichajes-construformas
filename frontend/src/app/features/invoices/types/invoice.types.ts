export interface Invoice {
  id?: number;
  projectId: number;
  projectName?: string;
  clientId: number;
  clientName?: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  issuedDate?: string;
  dueDate?: string;
  notes?: string;
  createdById: number;
  createdByName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface InvoiceItem {
  id?: number;
  invoiceId?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  orderNum: number;
}

export interface RectifyingInvoice {
  id?: number;
  originalInvoiceId: number;
  invoiceNumber: string;
  status: InvoiceStatus;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  reason: string;
  notes?: string;
}
