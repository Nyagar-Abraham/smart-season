export type UserRole = 'admin' | 'field_agent';

export interface User {
  id: number;
  email: string;
  fullName: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

export interface SignupResponse {
  user: Omit<User, 'passwordHash'>;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<User, 'passwordHash'>;
  token: string;
}
