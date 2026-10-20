export interface LoginRequest {
  email?: string;
  nie?: string;
  password: string;
}

export interface AuthResponse {
  /** User id; absent in tokens issued before the clock rework. */
  id?: number;
  accessToken: string;
  refreshToken: string;
  email: string;
  roles: string[];
  name: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  nie?: string;
  phone?: string;
  roles: string[];
  availability?: string;
  active: boolean;
}
