import { useState, useCallback, useEffect } from 'react';
import { APIResponse } from '../types/apiTypes';
import { BaseApiError, createApiError } from '../errors/apiErrors';
import { globalCache, createCacheKey } from '../utils/cacheManager';

export interface UseApiOptions<T> {
  autoFetch?: boolean;
  cacheKey?: string;
  ttlMs?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: BaseApiError) => void;
  initialData?: T | null;
}

export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: BaseApiError | null;
  isSuccess: boolean;
  isError: boolean;
  execute: (...args: any[]) => Promise<APIResponse<T> | null>;
  refetch: () => Promise<APIResponse<T> | null>;
  reset: () => void;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

export function useApi<T = any>(
  apiCall: (...args: any[]) => Promise<APIResponse<T>>,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const { autoFetch = false, cacheKey, ttlMs, onSuccess, onError, initialData = null } = options;

  const [data, setData] = useState<T | null>(() => {
    if (cacheKey) {
      const cached = globalCache.get(cacheKey);
      if (cached) return cached;
    }
    return initialData;
  });

  const [loading, setLoading] = useState<boolean>(autoFetch && !data);
  const [error, setError] = useState<BaseApiError | null>(null);

  const execute = useCallback(
    async (...args: any[]): Promise<APIResponse<T> | null> => {
      setLoading(true);
      setError(null);

      // Check cache if cacheKey provided
      const effectiveKey = cacheKey ? createCacheKey(cacheKey, args) : null;
      if (effectiveKey) {
        const cached = globalCache.get(effectiveKey);
        if (cached) {
          setData(cached);
          setLoading(false);
          if (onSuccess) onSuccess(cached);
          return {
            success: true,
            data: cached,
            message: 'Retrieved from cache',
            code: 200,
            timestamp: new Date().toISOString(),
          };
        }
      }

      try {
        const response = await apiCall(...args);

        if (response.success && response.data !== undefined) {
          setData(response.data);
          if (effectiveKey) {
            globalCache.set(effectiveKey, response.data, ttlMs);
          }
          if (onSuccess) onSuccess(response.data);
          return response;
        } else {
          const statusCode = typeof response.code === 'number' ? response.code : parseInt(String(response.code), 10) || 500;
          const apiErr = createApiError(statusCode, response.message);
          setError(apiErr);
          if (onError) onError(apiErr);
          return response;
        }
      } catch (err: any) {
        const formattedErr = err instanceof BaseApiError ? err : createApiError(500, err.message || 'Unknown API failure');
        setError(formattedErr);
        if (onError) onError(formattedErr);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, cacheKey, ttlMs, onSuccess, onError]
  );

  const refetch = useCallback(() => {
    if (cacheKey) {
      globalCache.invalidate(cacheKey);
    }
    return execute();
  }, [execute, cacheKey]);

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
  }, [initialData]);

  useEffect(() => {
    if (autoFetch) {
      execute();
    }
  }, [autoFetch]);

  return {
    data,
    loading,
    error,
    isSuccess: !loading && !error && data !== null,
    isError: !loading && error !== null,
    execute,
    refetch,
    reset,
    setData,
  };
}
