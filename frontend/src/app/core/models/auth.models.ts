export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: number;
  token: string;
  email: string;
  role: string;
}

export interface User {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone?: string;
  nie?: string;
  role: 'ADMIN' | 'OPERATOR';
  active: boolean;
  createdAt?: string;
}
