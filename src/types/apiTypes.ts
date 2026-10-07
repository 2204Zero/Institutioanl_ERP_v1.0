/**
 * Enterprise API Generic Response Interfaces and System State Types
 * Scalable for 250+ Educational ERP Modules
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
  code: number;
  timestamp: string;
  meta?: ResponseMetadata;
}

export interface ApiError {
  success: false;
  code: string;
  message: string;
  status: number;
  timestamp: string;
  details?: Record<string, string[] | string> | null;
  path?: string;
  requestId?: string;
}

export type APIResponse<T> =
  | {
      success: true;
      data: T;
      message: string;
      code: number;
      timestamp: string;
      meta?: ResponseMetadata;
    }
  | {
      success: false;
      data?: null;
      message: string;
      code: number;
      timestamp: string;
      meta?: ResponseMetadata;
    };

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Enterprise alias requested in specification
export type PaginationResponse<T> = PaginatedResponse<T>;

export interface ErrorResponse {
  code: string;
  message: string;
  status: number;
  timestamp: string;
  details?: Record<string, string[] | string> | null;
  path?: string;
  requestId?: string;
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
