/**
 * Mirrors the backend RBAC contract. `roles` is a many-to-many set persisted in the
 * `user_roles` join table (V9 migration); the single-role `role` column was dropped
 * and its `@Transient` echo always serializes as null, so it is deliberately absent here.
 */
export interface Role {
  id: number;
  name: string;
  description?: string;
}

/** Exactly the values accepted by the backend `UserAvailability` enum. */
export type UserAvailability =
  | 'AVAILABLE'
  | 'ON_SITE'
  | 'PARTIALLY_AVAILABLE'
  | 'UNAVAILABLE';

export interface User {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  nie?: string;
  /** Write-only on the backend: sent on create, never returned. */
  password?: string;
  roles: Role[];
  availability: UserAvailability;
  currentProjectId?: number;
  currentProjectName?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** The only two role rows seeded by V9__roles_and_availability.sql. */
export const ROLE_NAMES = ['ADMIN', 'OPERATOR'] as const;
export type RoleName = (typeof ROLE_NAMES)[number];

export const ROLE_LABELS: Record<RoleName, string> = {
  ADMIN: 'Administrador',
  OPERATOR: 'Operador',
};

/** Spanish label for a role name, falling back to the raw name. */
export function roleLabel(name: string): string {
  return (ROLE_LABELS as Record<string, string>)[name] ?? name;
}

export const AVAILABILITY_LABELS: Record<UserAvailability, string> = {
  AVAILABLE: 'Disponible',
  ON_SITE: 'En sitio',
  PARTIALLY_AVAILABLE: 'Parcialmente disponible',
  UNAVAILABLE: 'No disponible',
};
