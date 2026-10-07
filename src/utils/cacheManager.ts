import { API_CONFIG } from '../config/apiConfig';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
  etag?: string;
}

export class CacheManager<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private maxEntries: number;

  constructor(maxEntries: number = API_CONFIG.CACHE.MAX_ENTRIES) {
    this.maxEntries = maxEntries;
  }

  public get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > entry.ttlMs;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  public getStale(key: string): { data: T; isStale: boolean } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    const isStale = Date.now() - entry.timestamp > entry.ttlMs;
    return { data: entry.data, isStale };
  }

  public set(key: string, data: T, ttlMs: number = API_CONFIG.CACHE.DEFAULT_TTL_MS, etag?: string): void {
    if (this.cache.size >= this.maxEntries) {
      // Evict oldest entry (LRU simple evict)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttlMs,
      etag,
    });
  }

  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  public invalidate(pattern?: string | RegExp): void {
    if (!pattern) {
      this.clear();
      return;
    }
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (typeof pattern === 'string') {
        if (key.includes(pattern)) this.cache.delete(key);
      } else if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  public clear(): void {
    this.cache.clear();
  }

  public size(): number {
    return this.cache.size;
  }
}

export const globalCache = new CacheManager();

export const createCacheKey = (prefix: string, params?: Record<string, any>): string => {
  if (!params || Object.keys(params).length === 0) return prefix;
  const sortedKeys = Object.keys(params).sort();
  const serialized = sortedKeys
    .map((k) => `${k}=${JSON.stringify(params[k])}`)
    .join('&');
  return `${prefix}:${serialized}`;
};
