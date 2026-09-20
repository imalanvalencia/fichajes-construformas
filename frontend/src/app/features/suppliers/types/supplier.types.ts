export interface Supplier {
  id?: number;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  taxId?: string;
  bankAccount?: string;
  notes?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
