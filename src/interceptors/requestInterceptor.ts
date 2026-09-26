import { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../config/apiConfig';
import { tokenStorage } from '../utils/tokenStorage';

export interface RequestOptions extends AxiosRequestConfig {
  skipAuth?: boolean;
  skipErrorHandling?: boolean;
  retryCount?: number;
  _retry?: boolean;
}

export interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  skipAuth?: boolean;
  skipErrorHandling?: boolean;
  retryCount?: number;
  _retry?: boolean;
}

export const requestFulfilled = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const customConfig = config as ExtendedAxiosRequestConfig;

  // 1. Authorization Header
  if (!customConfig.skipAuth) {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.set(
        API_CONFIG.HEADER_KEYS.AUTHORIZATION,
        `${API_CONFIG.AUTH_HEADER_PREFIX} ${token}`
      );
    }
  }

  // 2. Request ID & Correlation ID for Audit Tracking
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  config.headers.set(API_CONFIG.HEADER_KEYS.REQUEST_ID, requestId);

  if (!config.headers.has(API_CONFIG.HEADER_KEYS.CORRELATION_ID)) {
    config.headers.set(API_CONFIG.HEADER_KEYS.CORRELATION_ID, `corr-${Date.now()}`);
  }

  // 3. Dev Mode Request Logger
  if (API_CONFIG.IS_DEV) {
    const method = (config.method || 'GET').toUpperCase();
    const url = config.url || '';
    console.groupCollapsed(`%c[Request Interceptor] ${method} ${url}`, 'color: #3b82f6; font-weight: bold;');
    console.log('Headers:', config.headers);
    if (config.params) console.log('Params:', config.params);
    if (config.data) console.log('Payload:', config.data);
    console.log('Request ID:', requestId);
    console.groupEnd();
  }

  return config;
};

export const requestRejected = (error: unknown): Promise<never> => {
  if (API_CONFIG.IS_DEV) {
    console.error('[Request Interceptor Error]', error);
  }
  return Promise.reject(error);
};

export const attachRequestInterceptor = (instance: AxiosInstance): number => {
  return instance.interceptors.request.use(requestFulfilled, requestRejected);
};
