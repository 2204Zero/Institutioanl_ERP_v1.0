/**
 * Enterprise API Generic Response Interfaces & System State Types
 * Designed for 250+ Educational ERP Modules
 * Strict TypeScript - No 'any'
 */

export interface ResponseMetadata {
  requestId?: string;
  correlationId?: string;
  executionTimeMs?: number;
  apiVersion?: string;
  cacheHit?: boolean;
  extra?: Record<string, string | number | boolean>;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message: string;
  code: number | string;
  timestamp: string;
  meta?: ResponseMetadata;
}

export interface ApiError {
  success: false;
  code: string | number;
  message: string;
  status?: number;
  timestamp: string;
  details?: Record<string, string[] | string> | null;
  path?: string;
  requestId?: string;
  data?: null;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
export type APIResponse<T> = ApiResponse<T>;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export type PaginationResponse<T> = PaginatedResponse<T>;

export interface ErrorResponse {
  code: string | number;
  message: string;
  status: number;
  timestamp: string;
  details?: Record<string, string[] | string> | null;
  path?: string;
  requestId?: string;
}

export interface ValidationFieldError {
  field: string;
  message: string;
  rejectedValue?: unknown;
}

export interface ValidationResponse {
  code: 'VALIDATION_ERROR' | string;
  message: string;
  errors: ValidationFieldError[];
  status: 400 | 422 | number;
  timestamp: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
  issuedAt?: number;
}

export interface AuthResponse extends TokenResponse {
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    role: string;
    roles?: string[];
    permissions: string[];
    institutionId?: string;
    departmentId?: string;
    avatarUrl?: string;
  };
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams {
  keyword: string;
  fields?: string[];
  exactMatch?: boolean;
}

export interface FilterParams {
  [key: string]: string | number | boolean | Array<string | number> | undefined;
}

export type LoadingState =
  | 'idle'
  | 'loading'
  | 'refreshing'
  | 'submitting'
  | 'deleting'
  | 'updating'
  | 'searching'
  | 'filtering'
  | 'paginationLoading'
  | 'success'
  | 'error';

export type RequestStatus = 'idle' | 'pending' | 'resolved' | 'rejected';
