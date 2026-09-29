import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_CONFIG } from '../config/apiConfig';
import { createApiError, BaseApiError } from '../errors/apiErrors';
import { APIResponse } from '../types/api';
import { attachRequestInterceptor, RequestOptions } from '../interceptors/requestInterceptor';
import { attachResponseInterceptor, onUnauthorized, notifyUnauthorized } from '../interceptors/responseInterceptor';

export type { RequestOptions };
export { onUnauthorized, notifyUnauthorized };

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
      },
    });

    // Attach modular enterprise interceptors
    attachRequestInterceptor(this.instance);
    attachResponseInterceptor(this.instance);
  }

  /**
   * Helper to normalize raw backend DTOs and enterprise API response envelopes
   */
  private normalizeResponse<T>(response: AxiosResponse<unknown>): APIResponse<T> {
    const data = response.data;
    const status = response.status;
    const requestId = response.headers?.[API_CONFIG.HEADER_KEYS.REQUEST_ID.toLowerCase()];

    // 1. If backend already wrapped in enterprise envelope
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      return data as APIResponse<T>;
    }

    // 2. Direct Spring Boot DTO response
    return {
      success: true,
      data: data as T,
      message: status === 201 ? 'Resource created successfully' : 'Request completed successfully',
      code: status,
      timestamp: new Date().toISOString(),
      meta: {
        requestId,
        apiVersion: API_CONFIG.API_VERSION,
      },
    };
  }

  // ---------------------------------------------------------------
  // HTTP METHODS
  // ---------------------------------------------------------------
  public async get<T = unknown>(
    endpoint: string,
    params?: Record<string, unknown>,
    options?: RequestOptions
  ): Promise<APIResponse<T>> {
    try {
      const response = await this.instance.get<T>(endpoint, {
        ...options,
        params,
      });
      return this.normalizeResponse<T>(response);
    } catch (err: unknown) {
      if (err instanceof BaseApiError) throw err;
      throw createApiError(0, (err as Error)?.message || 'GET Request Failed');
    }
  }

  public async post<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<APIResponse<T>> {
    try {
      const response = await this.instance.post<T>(endpoint, body, options);
      return this.normalizeResponse<T>(response);
    } catch (err: unknown) {
      if (err instanceof BaseApiError) throw err;
      throw createApiError(0, (err as Error)?.message || 'POST Request Failed');
    }
  }

  public async put<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<APIResponse<T>> {
    try {
      const response = await this.instance.put<T>(endpoint, body, options);
      return this.normalizeResponse<T>(response);
    } catch (err: unknown) {
      if (err instanceof BaseApiError) throw err;
      throw createApiError(0, (err as Error)?.message || 'PUT Request Failed');
    }
  }

  public async patch<T = unknown>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<APIResponse<T>> {
    try {
      const response = await this.instance.patch<T>(endpoint, body, options);
      return this.normalizeResponse<T>(response);
    } catch (err: unknown) {
      if (err instanceof BaseApiError) throw err;
      throw createApiError(0, (err as Error)?.message || 'PATCH Request Failed');
    }
  }

  public async delete<T = unknown>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<APIResponse<T>> {
    try {
      const response = await this.instance.delete<T>(endpoint, options);
      return this.normalizeResponse<T>(response);
    } catch (err: unknown) {
      if (err instanceof BaseApiError) throw err;
      throw createApiError(0, (err as Error)?.message || 'DELETE Request Failed');
    }
  }

  /**
   * Raw Axios Instance Access for specialized binary streams (CSV/PDF export)
   */
  public getRawAxios(): AxiosInstance {
    return this.instance;
  }
}

export const apiClient = new ApiClient();
