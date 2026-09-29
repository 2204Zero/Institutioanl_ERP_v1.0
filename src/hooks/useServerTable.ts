import { useState, useCallback, useEffect, useTransition } from 'react';
import { PaginatedResponse, FilterParams, APIResponse } from '../types/api';

export interface UseServerTableOptions<T> {
  fetchFn: (params: {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: FilterParams;
  }) => Promise<APIResponse<PaginatedResponse<T>>>;
  initialPageSize?: number;
  initialSortBy?: string;
  initialSortOrder?: 'asc' | 'desc';
  autoFetch?: boolean;
}

export function useServerTable<T>({
  fetchFn,
  initialPageSize = 10,
  initialSortBy,
  initialSortOrder = 'asc',
  autoFetch = true,
}: UseServerTableOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<string | undefined>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);
  const [filters, setFilters] = useState<FilterParams>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [, startTransition] = useTransition();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchFn({
        page,
        pageSize,
        search,
        sortBy,
        sortOrder,
        filters,
      });

      if (response.success && response.data) {
        startTransition(() => {
          setData(response.data.items || []);
          setTotal(response.data.total || 0);
          setTotalPages(response.data.totalPages || 1);
        });
      } else {
        setError(response.message || 'Failed to load table data');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Server table error');
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, page, pageSize, search, sortBy, sortOrder, filters]);

  useEffect(() => {
    if (autoFetch) {
      loadData();
    }
  }, [loadData, autoFetch]);

  const handleSearchChange = useCallback((keyword: string) => {
    setSearch(keyword);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((field: string) => {
    setSortBy((prevSortBy) => {
      if (prevSortBy === field) {
        setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
        return field;
      }
      setSortOrder('asc');
      return field;
    });
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((newFilters: FilterParams) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  return {
    data,
    page,
    pageSize,
    total,
    totalPages,
    search,
    sortBy,
    sortOrder,
    filters,
    isLoading,
    error,
    refresh: loadData,
    setSearch: handleSearchChange,
    setPage: handlePageChange,
    setPageSize: handlePageSizeChange,
    setSort: handleSortChange,
    setFilters: handleFilterChange,
  };
}
