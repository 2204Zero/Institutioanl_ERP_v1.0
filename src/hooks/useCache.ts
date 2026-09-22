import { useCallback, useState } from 'react';
import { globalCache, createCacheKey } from '../utils/cacheManager';

export interface UseCacheResult<T = any> {
  getCache: (key: string, params?: Record<string, any>) => T | null;
  setCache: (key: string, data: T, ttlMs?: number, params?: Record<string, any>) => void;
  invalidateCache: (pattern?: string | RegExp) => void;
  clearCache: () => void;
  hasCache: (key: string, params?: Record<string, any>) => boolean;
  cacheSize: number;
}

export function useCache<T = any>(): UseCacheResult<T> {
  const [cacheSize, setCacheSize] = useState<number>(globalCache.size());

  const getCache = useCallback((key: string, params?: Record<string, any>): T | null => {
    const fullKey = createCacheKey(key, params);
    return globalCache.get(fullKey);
  }, []);

  const setCache = useCallback(
    (key: string, data: T, ttlMs?: number, params?: Record<string, any>): void => {
      const fullKey = createCacheKey(key, params);
      globalCache.set(fullKey, data, ttlMs);
      setCacheSize(globalCache.size());
    },
    []
  );

  const invalidateCache = useCallback((pattern?: string | RegExp): void => {
    globalCache.invalidate(pattern);
    setCacheSize(globalCache.size());
  }, []);

  const clearCache = useCallback(() => {
    globalCache.clear();
    setCacheSize(0);
  }, []);

  const hasCache = useCallback((key: string, params?: Record<string, any>): boolean => {
    const fullKey = createCacheKey(key, params);
    return globalCache.has(fullKey);
  }, []);

  return {
    getCache,
    setCache,
    invalidateCache,
    clearCache,
    hasCache,
    cacheSize,
  };
}
