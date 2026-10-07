/**
 * Reusable Filtering and Sorting Utilities
 */

export const filterUtils = {
  filterObjects<T>(
    items: T[],
    filters: Partial<Record<keyof T, any>>
  ): T[] {
    const activeFilters = Object.entries(filters).filter(
      ([_, value]) => value !== undefined && value !== null && value !== '' && value !== 'All'
    );

    if (activeFilters.length === 0) return items;

    return items.filter((item) => {
      return activeFilters.every(([key, filterValue]) => {
        const itemValue = item[key as keyof T];

        if (Array.isArray(filterValue)) {
          return filterValue.includes(itemValue);
        }

        if (typeof filterValue === 'string') {
          return String(itemValue).toLowerCase() === filterValue.toLowerCase();
        }

        return itemValue === filterValue;
      });
    });
  },

  sortObjects<T>(
    items: T[],
    sortBy: keyof T,
    order: 'asc' | 'desc' = 'asc'
  ): T[] {
    if (!sortBy) return items;

    return [...items].sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      let comparison = 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else {
        comparison = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
      }

      return order === 'desc' ? -comparison : comparison;
    });
  },
};
