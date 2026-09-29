/**
 * Authentication & Authorization Types
 * Fully aligned with Spring Boot Security, JWT, RBAC & Institutional ERP Roles
 */

export type Role =
  | 'SuperAdmin'
  | 'Admin'
  | 'Dean'
  | 'Faculty'
  | 'Teacher'
  | 'Student'
  | 'Parent'
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
  | 'write:academics'
  | 'manage:users'
  | 'manage:roles'
  | 'read:audit'
  | 'write:audit';

export interface UserDevice {
  id: string;
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
  lastActiveAt: string;
  isCurrentDevice: boolean;
}

export interface UserSession {
  id: string;
  sessionId: string;
  userId: string;
  device: UserDevice;
  loginAt: string;
  expiresAt: string;
  isActive: boolean;
}

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
  isEmailVerified?: boolean;
  failedLoginAttempts?: number;
  isAccountLocked?: boolean;
  provider?: 'credentials' | 'google' | 'microsoft' | 'github';
  phone?: string;
  address?: string;
}

import { AuthResponse, TokenResponse } from './api';
export type { AuthResponse, TokenResponse };

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
  role?: Role;
}

export interface SignUpRequest {
  fullName: string;
  email: string;
  username: string;
  password?: string;
  department?: string;
  role?: Role;
  agreeToTerms?: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword?: string;
}

export interface ChangePasswordRequest {
  oldPassword?: string;
  newPassword?: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface OAuthLoginRequest {
  provider: 'google' | 'microsoft' | 'github';
  idToken?: string;
  accessToken?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  token: Token;
  sessions?: UserSession[];
}

export interface DecodedToken {
  sub: string;
  username: string;
  role?: Role;
  permissions?: Permission[];
  iat: number;
  exp: number;
  iss?: string;
}
