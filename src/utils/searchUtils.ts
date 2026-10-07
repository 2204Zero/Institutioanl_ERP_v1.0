/**
 * Generic High-Performance Partial Search & Multi-Field Filter Engine
 */

export const searchUtils = {
  searchObjects<T>(
    items: T[],
    keyword: string,
    fields: (keyof T)[] = []
  ): T[] {
    if (!keyword || keyword.trim() === '') return items;

    const query = keyword.toLowerCase().trim();

    return items.filter((item) => {
      // If specific fields provided, search within them
      if (fields.length > 0) {
        return fields.some((field) => {
          const val = item[field];
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(query);
        });
      }

      // Otherwise search all top-level string and number values
      return Object.keys(item as object).some((key) => {
        const val = item[key as keyof T];
        if (val === null || val === undefined) return false;
        if (typeof val === 'string' || typeof val === 'number') {
          return String(val).toLowerCase().includes(query);
        }
        return false;
      });
    });
  },

  matchesQuery<T>(item: T, query: string, field: keyof T): boolean {
    if (!query) return true;
    const val = item[field];
    if (val === null || val === undefined) return false;
    return String(val).toLowerCase().includes(query.toLowerCase().trim());
  },
};
