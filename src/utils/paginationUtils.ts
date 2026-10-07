import { PaginatedResponse, PaginationParams } from '../types/apiTypes';

export const paginationUtils = {
  calculateTotalPages(totalItems: number, pageSize: number): number {
    if (pageSize <= 0) return 1;
    return Math.ceil(totalItems / pageSize) || 1;
  },

  paginateArray<T>(
    items: T[],
    page: number = 1,
    pageSize: number = 10
  ): PaginatedResponse<T> {
    const validPage = Math.max(1, page);
    const validSize = Math.max(1, pageSize);
    const total = items.length;
    const totalPages = this.calculateTotalPages(total, validSize);
    
    const startIndex = (validPage - 1) * validSize;
    const endIndex = startIndex + validSize;
    const paginatedItems = items.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      total,
      page: validPage,
      pageSize: validSize,
      totalPages,
      hasNext: validPage < totalPages,
      hasPrevious: validPage > 1,
    };
  },

  createPaginationParams(
    page: number = 1,
    pageSize: number = 10,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc'
  ): PaginationParams {
    return {
      page: Math.max(1, page),
      pageSize: Math.max(1, pageSize),
      sortBy,
      sortOrder,
    };
  },
};
