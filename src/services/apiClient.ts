import { API_CONFIG } from '../config/apiConfig';
import { tokenStorage } from '../utils/tokenStorage';
import { createApiError, NetworkError, TimeoutError } from '../errors/apiErrors';
import { APIResponse } from '../types/apiTypes';

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  retryCount?: number;
  skipAuth?: boolean;
  params?: Record<string, any>;
  signal?: AbortSignal;
}

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.defaultTimeout = API_CONFIG.TIMEOUT;
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    if (!params || Object.keys(params).length === 0) return url;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach((v) => searchParams.append(key, String(v)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  private buildHeaders(customHeaders?: HeadersInit, skipAuth: boolean = false): Headers {
    const headers = new Headers(API_CONFIG.DEFAULT_HEADERS);

    if (customHeaders) {
      const custom = new Headers(customHeaders);
      custom.forEach((value, key) => headers.set(key, value));
    }

    if (!skipAuth) {
      const token = tokenStorage.getAccessToken();
      if (token) {
        headers.set(API_CONFIG.HEADER_KEYS.AUTHORIZATION, `${API_CONFIG.AUTH_HEADER_PREFIX} ${token}`);
      }
    }

    // Correlation ID for enterprise audit tracing
    if (!headers.has(API_CONFIG.HEADER_KEYS.CORRELATION_ID)) {
      headers.set(API_CONFIG.HEADER_KEYS.CORRELATION_ID, `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
    }

    return headers;
  }

  public async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<APIResponse<T>> {
    const {
      timeoutMs = this.defaultTimeout,
      retryCount = 0,
      skipAuth = false,
      params,
      headers: customHeaders,
      signal: customSignal,
      ...fetchOptions
    } = options;

    const url = this.buildUrl(endpoint, params);
    const headers = this.buildHeaders(customHeaders, skipAuth);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // Combine custom signal with timeout signal if provided
    if (customSignal) {
      customSignal.addEventListener('abort', () => controller.abort());
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data: any;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        // Handle retryable status codes
        if (
          API_CONFIG.RETRY.RETRYABLE_STATUS_CODES.includes(response.status) &&
          retryCount < API_CONFIG.RETRY.MAX_RETRIES
        ) {
          const delay = API_CONFIG.RETRY.INITIAL_DELAY_MS * Math.pow(API_CONFIG.RETRY.BACKOFF_FACTOR, retryCount);
          await new Promise((res) => setTimeout(res, delay));
          return this.request<T>(endpoint, { ...options, retryCount: retryCount + 1 });
        }

        const message = data?.message || response.statusText || `HTTP Error ${response.status}`;
        throw createApiError(response.status, message, data);
      }

      // Format response as standard APIResponse
      if (data && typeof data === 'object' && 'success' in data) {
        return data as APIResponse<T>;
      }

      return {
        success: true,
        data: data as T,
        message: 'Request completed successfully',
        code: response.status,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      clearTimeout(timeoutId);

      if (err.name === 'AbortError') {
        throw new TimeoutError(`Request timed out after ${timeoutMs}ms`);
      }

      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new NetworkError('Failed to communicate with server. Network connection offline or blocked.');
      }

      // If already a BaseApiError, throw directly
      if (err.status !== undefined) {
        throw err;
      }

      throw createApiError(0, err.message || 'Unknown network error');
    }
  }

  public async get<T = any>(endpoint: string, params?: Record<string, any>, options?: Omit<RequestOptions, 'params'>): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET', params });
  }

  public async post<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async put<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async patch<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async delete<T = any>(endpoint: string, options?: RequestOptions): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
