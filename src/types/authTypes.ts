/**
 * Authentication & Authorization Types
 */

export type Role =
  | 'SuperAdmin'
  | 'Admin'
  | 'Dean'
  | 'Faculty'
  | 'Student'
  | 'Accountant'
  | 'Librarian'
  | 'HostelWarden';

export type Permission =
  | 'read:all'
  | 'write:all'
  | 'delete:all'
  | 'read:students'
  | 'write:students'
  | 'delete:students'
  | 'read:finance'
  | 'write:finance'
  | 'approve:refund'
  | 'read:academics'
  | 'write:academics';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: Role;
  permissions: Permission[];
  department?: string;
  avatarUrl?: string;
  lastLoginAt?: string;
  isActive: boolean;
}

export interface Token {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number; // Seconds
  issuedAt: number; // Timestamp ms
}

export interface LoginRequest {
  username: string;
  password?: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  token: Token;
}

export interface DecodedToken {
  sub: string;
  username: string;
  role: Role;
  permissions: Permission[];
  iat: number;
  exp: number;
  iss: string;
}
