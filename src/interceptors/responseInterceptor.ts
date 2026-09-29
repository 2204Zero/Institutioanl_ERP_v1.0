import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { API_CONFIG } from '../config/apiConfig';
import { tokenStorage } from '../utils/tokenStorage';
import { createApiError, NetworkError, TimeoutError } from '../errors/apiErrors';
import { ExtendedAxiosRequestConfig } from './requestInterceptor';

type RefreshSubscriber = (token: string) => void;

let isRefreshing = false;
let refreshSubscribers: RefreshSubscriber[] = [];

const subscribeTokenRefresh = (callback: RefreshSubscriber): void => {
  refreshSubscribers.push(callback);
};

const notifyTokenRefreshed = (newToken: string): void => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

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
      console.error('[Response Interceptor] Error invoking unauthorized handler:', err);
    }
  });
};

export const responseFulfilled = (response: AxiosResponse): AxiosResponse => {
  if (API_CONFIG.IS_DEV) {
    const method = (response.config.method || 'GET').toUpperCase();
    const url = response.config.url || '';
    console.log(
      `%c[Response Interceptor ${response.status}] ${method} ${url}`,
      'color: #10b981; font-weight: bold;',
      response.data
    );
  }
  return response;
};

export const responseRejected = async (
  error: unknown,
  instance: AxiosInstance
): Promise<AxiosResponse | never> => {
  const errObj = error as {
    config?: ExtendedAxiosRequestConfig;
    response?: AxiosResponse;
    code?: string;
    message?: string;
  };

  const originalRequest = errObj.config;

  // 1. Network / Timeout Handling
  if (!errObj.response) {
    if (errObj.code === 'ECONNABORTED' || errObj.message?.includes('timeout')) {
      const timeoutErr = new TimeoutError(`Request timed out after ${API_CONFIG.TIMEOUT}ms`);
      return Promise.reject(timeoutErr);
    }
    const netErr = new NetworkError(
      errObj.message?.includes('Network Error')
        ? 'Unable to communicate with ERP server. Backend offline or blocked by CORS.'
        : errObj.message || 'Network communication failure.'
    );
    return Promise.reject(netErr);
  }

  const status = errObj.response.status;
  const responseData = errObj.response.data;
  const requestId = errObj.response.headers?.[API_CONFIG.HEADER_KEYS.REQUEST_ID.toLowerCase()];

  // 2. 401 Unauthorized Silent Refresh Workflow
  const isAuthEndpoint =
    originalRequest?.url?.includes('/auth/login') ||
    originalRequest?.url?.includes('/auth/refresh');

  if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
    const refreshToken = tokenStorage.getRefreshToken();

    if (refreshToken) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken: string) => {
            originalRequest.headers.set(
              API_CONFIG.HEADER_KEYS.AUTHORIZATION,
              `${API_CONFIG.AUTH_HEADER_PREFIX} ${newToken}`
            );
            resolve(instance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
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

          notifyTokenRefreshed(newAccessToken);
          isRefreshing = false;

          originalRequest.headers.set(
            API_CONFIG.HEADER_KEYS.AUTHORIZATION,
            `${API_CONFIG.AUTH_HEADER_PREFIX} ${newAccessToken}`
          );
          return instance(originalRequest);
        }
      } catch (refreshErr) {
        isRefreshing = false;
        refreshSubscribers = [];
        notifyUnauthorized();
        const authErr = createApiError(401, 'Session expired. Please log in again.', null, requestId);
        return Promise.reject(authErr);
      }
    } else {
      notifyUnauthorized();
    }
  }

  // 3. Status Error Mapping
  const message =
    (typeof responseData === 'object' && (responseData?.message || responseData?.error)) ||
    errObj.message ||
    `HTTP Error ${status}`;
  const details = typeof responseData === 'object' ? responseData : null;

  const apiError = createApiError(status, message, details, requestId);
  return Promise.reject(apiError);
};

export const attachResponseInterceptor = (instance: AxiosInstance): number => {
  return instance.interceptors.response.use(
    (response) => responseFulfilled(response),
    (error) => responseRejected(error, instance)
  );
};
