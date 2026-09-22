import { useState, useMemo, useCallback } from 'react';
import { filterUtils } from '../utils/filterUtils';

export interface UseFilterOptions<T> {
  initialFilters?: Partial<Record<keyof T, any>>;
  initialSortBy?: keyof T;
  initialSortOrder?: 'asc' | 'desc';
  data?: T[];
}

export interface UseFilterResult<T> {
  filters: Partial<Record<keyof T, any>>;
  sortBy: keyof T | undefined;
  sortOrder: 'asc' | 'desc';
  setFilter: (key: keyof T, value: any) => void;
  setFilters: (filters: Partial<Record<keyof T, any>>) => void;
  setSorting: (field: keyof T, order?: 'asc' | 'desc') => void;
  toggleSortOrder: () => void;
  resetFilters: () => void;
  filteredItems: T[];
  activeFilterCount: number;
}

export function useFilter<T = any>(options: UseFilterOptions<T> = {}): UseFilterResult<T> {
  const { initialFilters = {}, initialSortBy, initialSortOrder = 'asc', data = [] } = options;

  const [filters, setFiltersState] = useState<Partial<Record<keyof T, any>>>(initialFilters);
  const [sortBy, setSortBy] = useState<keyof T | undefined>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

  const setFilter = useCallback((key: keyof T, value: any) => {
    setFiltersState((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const setFilters = useCallback((newFilters: Partial<Record<keyof T, any>>) => {
    setFiltersState(newFilters);
  }, []);

  const setSorting = useCallback((field: keyof T, order?: 'asc' | 'desc') => {
    setSortBy(field);
    if (order) setSortOrder(order);
  }, []);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(initialFilters);
    setSortBy(initialSortBy);
    setSortOrder(initialSortOrder);
  }, [initialFilters, initialSortBy, initialSortOrder]);

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(
      (val) => val !== undefined && val !== null && val !== '' && val !== 'All'
    ).length;
  }, [filters]);

  const filteredItems = useMemo(() => {
    if (!data || data.length === 0) return [];
    let result = filterUtils.filterObjects(data, filters);
    if (sortBy) {
      result = filterUtils.sortObjects(result, sortBy, sortOrder);
    }
    return result;
  }, [data, filters, sortBy, sortOrder]);

  return {
    filters,
    sortBy,
    sortOrder,
    setFilter,
    setFilters,
    setSorting,
    toggleSortOrder,
    resetFilters,
    filteredItems,
    activeFilterCount,
  };
}
