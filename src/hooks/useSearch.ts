import { useState, useEffect, useMemo, useCallback } from 'react';
import { searchUtils } from '../utils/searchUtils';

export interface UseSearchOptions<T> {
  initialKeyword?: string;
  fields?: (keyof T)[];
  debounceMs?: number;
  data?: T[];
}

export interface UseSearchResult<T> {
  keyword: string;
  debouncedKeyword: string;
  setKeyword: (kw: string) => void;
  clearSearch: () => void;
  results: T[];
  isSearching: boolean;
}

export function useSearch<T = any>(options: UseSearchOptions<T> = {}): UseSearchResult<T> {
  const { initialKeyword = '', fields = [], debounceMs = 300, data = [] } = options;

  const [keyword, setKeyword] = useState<string>(initialKeyword);
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>(initialKeyword);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [keyword, debounceMs]);

  const results = useMemo(() => {
    if (!data || data.length === 0) return [];
    return searchUtils.searchObjects(data, debouncedKeyword, fields);
  }, [data, debouncedKeyword, fields]);

  const clearSearch = useCallback(() => {
    setKeyword('');
    setDebouncedKeyword('');
  }, []);

  return {
    keyword,
    debouncedKeyword,
    setKeyword,
    clearSearch,
    results,
    isSearching: keyword.trim().length > 0 && keyword !== debouncedKeyword,
  };
}
