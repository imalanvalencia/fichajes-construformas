export interface User {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  nie?: string;
  password?: string;
  role: UserRole;
  availability: UserAvailability;
  currentProjectId?: number;
  currentProjectName?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type UserRole = 'ADMIN' | 'OPERATOR' | 'MANAGER';

export type UserAvailability = 'AVAILABLE' | 'ON_LEAVE' | 'INACTIVE';
