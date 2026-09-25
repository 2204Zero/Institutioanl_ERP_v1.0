import { useState, useCallback, useMemo } from 'react';
import { paginationUtils } from '../utils/paginationUtils';

export interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  initialTotalItems?: number;
}

export interface UsePaginationResult {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  setPage: (page: number | ((prev: number) => number)) => void;
  setPageSize: (size: number) => void;
  setTotalItems: (total: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  resetPagination: () => void;
}

export function usePagination(options: UsePaginationOptions = {}): UsePaginationResult {
  const { initialPage = 1, initialPageSize = 10, initialTotalItems = 0 } = options;

  const [page, setPageState] = useState<number>(initialPage);
  const [pageSize, setPageSizeState] = useState<number>(initialPageSize);
  const [totalItems, setTotalItems] = useState<number>(initialTotalItems);

  const totalPages = useMemo(
    () => paginationUtils.calculateTotalPages(totalItems, pageSize),
    [totalItems, pageSize]
  );

  const hasNext = page < totalPages;
  const hasPrevious = page > 1;

  const setPage = useCallback((pageArg: number | ((prev: number) => number)) => {
    setPageState((prev) => {
      const nextPageNum = typeof pageArg === 'function' ? pageArg(prev) : pageArg;
      return Math.max(1, nextPageNum);
    });
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(Math.max(1, size));
    setPageState(1); // Reset to first page when page size changes
  }, []);

  const nextPage = useCallback(() => {
    setPageState((prev) => (prev < totalPages ? prev + 1 : prev));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPageState((prev) => (prev > 1 ? prev - 1 : prev));
  }, []);

  const firstPage = useCallback(() => setPageState(1), []);
  const lastPage = useCallback(() => setPageState(totalPages), [totalPages]);

  const resetPagination = useCallback(() => {
    setPageState(initialPage);
    setPageSizeState(initialPageSize);
    setTotalItems(initialTotalItems);
  }, [initialPage, initialPageSize, initialTotalItems]);

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    hasNext,
    hasPrevious,
    setPage,
    setPageSize,
    setTotalItems,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    resetPagination,
  };
}
