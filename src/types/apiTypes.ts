/**
 * Enterprise API Generic Response Interfaces and System State Types
 * Scalable for 250+ Educational ERP Modules
 */

export interface APIResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  code: number;
  timestamp: string;
  meta?: ResponseMetadata;
}

export interface ResponseMetadata {
  requestId?: string;
  executionTimeMs?: number;
  apiVersion?: string;
  cacheHit?: boolean;
  [key: string]: any;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ErrorResponse {
  code: string;
  message: string;
  status: number;
  timestamp: string;
  details?: Record<string, string[]> | any;
  path?: string;
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
