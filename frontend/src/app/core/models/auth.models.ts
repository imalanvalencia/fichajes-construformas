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
  userId: number;
  email: string;
  role: string;
}
