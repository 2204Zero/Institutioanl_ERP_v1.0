import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { API_CONFIG } from '../config/apiConfig';
import { tokenStorage } from '../utils/tokenStorage';
import { createApiError, BaseApiError, NetworkError, TimeoutError } from '../errors/apiErrors';
import { APIResponse } from '../types/apiTypes';

export interface RequestOptions extends AxiosRequestConfig {
  skipAuth?: boolean;
  skipErrorHandling?: boolean;
  retryCount?: number;
  _retry?: boolean;
}

// Global subscribers for unauthorized / session expired events
type UnauthorizedHandler = () => void;
const unauthorizedHandlers: Set<UnauthorizedHandler> = new Set();

export const onUnauthorized = (handler: UnauthorizedHandler): (() => void) => {
  unauthorizedHandlers.add(handler);
  return () => unauthorizedHandlers.delete(handler);
};

export const notifyUnauthorized = (): void => {
  tokenStorage.clearTokens();
  unauthorizedHandlers.forEach((handler) => {
    try {
      handler();
    } catch (err) {
      console.error('[ApiClient] Error invoking unauthorized handler:', err);
    }
  });
};

class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.instance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
      },
    });

    this.setupInterceptors();
  }

  private onTokenRefreshed(token: string): void {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  private setupInterceptors(): void {
    // -------------------------------------------------------------
    // REQUEST INTERCEPTOR
    // Automatically attaches:
    // 1. Authorization Bearer Token
    // 2. Request ID & Correlation ID for enterprise audit tracing
    // 3. Platform & version metadata
    // 4. Structured dev logger
    // -------------------------------------------------------------
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const customConfig = config as InternalAxiosRequestConfig & RequestOptions;

        // 1. Bearer Token
        if (!customConfig.skipAuth) {
          const token = tokenStorage.getAccessToken();
          if (token) {
            config.headers.set(
              API_CONFIG.HEADER_KEYS.AUTHORIZATION,
              `${API_CONFIG.AUTH_HEADER_PREFIX} ${token}`
            );
          }
        }

        // 2. Request ID & Correlation ID
        const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        config.headers.set(API_CONFIG.HEADER_KEYS.REQUEST_ID, requestId);

        if (!config.headers.has(API_CONFIG.HEADER_KEYS.CORRELATION_ID)) {
          config.headers.set(API_CONFIG.HEADER_KEYS.CORRELATION_ID, `corr-${Date.now()}`);
        }

        // 3. Development logging
        if (API_CONFIG.IS_DEV) {
          const method = (config.method || 'GET').toUpperCase();
          const url = config.url || '';
          console.groupCollapsed(`%c[API Request] ${method} ${url}`, 'color: #3b82f6; font-weight: bold;');
          console.log('Headers:', config.headers);
          if (config.params) console.log('Params:', config.params);
          if (config.data) console.log('Payload:', config.data);
          console.log('Request ID:', requestId);
          console.groupEnd();
        }

        return config;
      },
      (error) => {
        if (API_CONFIG.IS_DEV) {
          console.error('[API Request Error]', error);
        }
        return Promise.reject(error);
      }
    );

    // -------------------------------------------------------------
    // RESPONSE & ERROR INTERCEPTOR
    // Handles 200, 201, 204
    // Handles 400, 401 (Auto Refresh / Logout), 403, 404, 409, 422, 429, 500, 502, 503, 504
    // -------------------------------------------------------------
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        if (API_CONFIG.IS_DEV) {
          const method = (response.config.method || 'GET').toUpperCase();
          const url = response.config.url || '';
          console.log(`%c[API Response ${response.status}] ${method} ${url}`, 'color: #10b981; font-weight: bold;', response.data);
        }
        return response;
      },
      async (error) => {
        const originalRequest = error.config as (InternalAxiosRequestConfig & RequestOptions) | undefined;

        // Check for Network Error (Server offline, CORS failure, connection dropped)
        if (!error.response) {
          if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            const timeoutErr = new TimeoutError(`Request timed out after ${API_CONFIG.TIMEOUT}ms`);
            return Promise.reject(timeoutErr);
          }
          const netErr = new NetworkError(
            error.message?.includes('Network Error')
              ? 'Unable to communicate with ERP server. Server offline or blocked by CORS.'
              : error.message || 'Network communication failure.'
          );
          return Promise.reject(netErr);
        }

        const status = error.response.status;
        const responseData = error.response.data;
        const requestId = error.response.headers?.[API_CONFIG.HEADER_KEYS.REQUEST_ID.toLowerCase()];

        // ---------------------------------------------------------
        // 401 Unauthorized handling & Token Refresh workflow
        // ---------------------------------------------------------
        const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/refresh');

        if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
          const refreshToken = tokenStorage.getRefreshToken();

          if (refreshToken) {
            if (this.isRefreshing) {
              return new Promise((resolve) => {
                this.addRefreshSubscriber((newToken: string) => {
                  originalRequest.headers.set(
                    API_CONFIG.HEADER_KEYS.AUTHORIZATION,
                    `${API_CONFIG.AUTH_HEADER_PREFIX} ${newToken}`
                  );
                  resolve(this.instance(originalRequest));
                });
              });
            }

            originalRequest._retry = true;
            this.isRefreshing = true;

            try {
              // Call Spring Boot /auth/refresh directly with refresh token
              const refreshResponse = await axios.post(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`,
                { refreshToken },
                { headers: API_CONFIG.DEFAULT_HEADERS }
              );

              const newTokens = refreshResponse.data;
              const newAccessToken = newTokens.accessToken || newTokens.token?.accessToken;
              const newRefreshToken = newTokens.refreshToken || refreshToken;

              if (newAccessToken) {
                tokenStorage.setAccessToken(newAccessToken);
                if (newRefreshToken) tokenStorage.setRefreshToken(newRefreshToken);

                this.onTokenRefreshed(newAccessToken);
                this.isRefreshing = false;

                originalRequest.headers.set(
                  API_CONFIG.HEADER_KEYS.AUTHORIZATION,
                  `${API_CONFIG.AUTH_HEADER_PREFIX} ${newAccessToken}`
                );
                return this.instance(originalRequest);
              }
            } catch (refreshErr) {
              this.isRefreshing = false;
              this.refreshSubscribers = [];
              notifyUnauthorized();
              const authErr = createApiError(401, 'Session expired. Please log in again.', null, requestId);
              return Promise.reject(authErr);
            }
          } else {
            notifyUnauthorized();
          }
        }

        // Map status codes to typed exceptions
        const message =
          (typeof responseData === 'object' && (responseData?.message || responseData?.error)) ||
          error.message ||
          `HTTP Error ${status}`;
        const details = typeof responseData === 'object' ? responseData : null;

        const apiError = createApiError(status, message, details, requestId);
        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Helper to normalize raw backend and wrapped ERP responses
   */
  private normalizeResponse<T>(response: AxiosResponse<any>): APIResponse<T> {
    const data = response.data;
    const status = response.status;
    const requestId = response.headers?.[API_CONFIG.HEADER_KEYS.REQUEST_ID.toLowerCase()];

    // 1. If backend already wrapped in enterprise envelope
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      return data as APIResponse<T>;
    }

    // 2. Direct Spring Boot DTO response (e.g. AuthResponse, Student list, Student object)
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
   * Raw Axios Instance Access for specialized binary streams (e.g., CSV/PDF export)
   */
  public getRawAxios(): AxiosInstance {
    return this.instance;
  }
}

export const apiClient = new ApiClient();
