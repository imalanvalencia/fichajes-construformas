export interface Client {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  notes?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
