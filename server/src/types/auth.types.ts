import { User } from './user.types';

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: 'user' | 'admin';
  iat: number;
  exp: number;
}

export interface LoginRequest  { email: string; password: string; }
export interface LoginResponse { accessToken: string; user: User; }
export interface RegisterRequest { name: string; email: string; password: string; }
