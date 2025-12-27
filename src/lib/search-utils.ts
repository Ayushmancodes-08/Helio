/**
 * Search and Filter Localization Utilities
 * Provides language-aware search functionality that works across language variants
 */

/**
 * Normalize search query for case-insensitive comparison
 * Handles special characters and diacritics
 */
export function normalizeSearchQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
}

/**
 * Check if a text matches a search query
 * Supports partial matching and is case-insensitive
 */
export function matchesSearchQuery(text: string, query: string): boolean {
  if (!query || !text) return false;
  
  const normalizedText = normalizeSearchQuery(text);
  const normalizedQuery = normalizeSearchQuery(query);
  
  return normalizedText.includes(normalizedQuery);
}

/**
 * Filter an array of items by search query
 * Works with any object that has a searchable field
 */
export function filterBySearchQuery<T>(
  items: T[],
  query: string,
  searchFields: (keyof T)[]
): T[] {
  if (!query || !query.trim()) {
    return items;
  }

  const normalizedQuery = normalizeSearchQuery(query);

  return items.filter((item) => {
    return searchFields.some((field) => {
      const value = item[field];
      if (value === null || value === undefined) return false;
      
      const stringValue = String(value);
      return matchesSearchQuery(stringValue, normalizedQuery);
    });
  });
}

/**
 * Search across multiple language variants
 * Useful for searching names that might be in different languages
 */
export function searchAcrossLanguageVariants(
  query: string,
  variants: Record<string, string>
): boolean {
  if (!query) return false;

  const normalizedQuery = normalizeSearchQuery(query);

  return Object.values(variants).some((variant) => {
    if (!variant) return false;
    return matchesSearchQuery(variant, normalizedQuery);
  });
}

/**
 * Highlight search query in text
 * Returns HTML with highlighted matches
 */
export function highlightSearchQuery(text: string, query: string): string {
  if (!query || !text) return text;

  const normalizedText = normalizeSearchQuery(text);
  const normalizedQuery = normalizeSearchQuery(query);

  if (!normalizedText.includes(normalizedQuery)) {
    return text;
  }

  // Find the original position and highlight
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Get search suggestions based on partial matches
 * Useful for autocomplete functionality
 */
export function getSearchSuggestions<T>(
  items: T[],
  query: string,
  searchFields: (keyof T)[],
  limit: number = 5
): T[] {
  if (!query || !query.trim()) {
    return items.slice(0, limit);
  }

  const filtered = filterBySearchQuery(items, query, searchFields);
  return filtered.slice(0, limit);
}

/**
 * Sort search results by relevance
 * Items that match the query at the beginning are ranked higher
 */
export function sortByRelevance<T>(
  items: T[],
  query: string,
  searchField: keyof T
): T[] {
  if (!query) return items;

  const normalizedQuery = normalizeSearchQuery(query);

  return [...items].sort((a, b) => {
    const aValue = normalizeSearchQuery(String(a[searchField] || ''));
    const bValue = normalizeSearchQuery(String(b[searchField] || ''));

    // Exact match gets highest priority
    if (aValue === normalizedQuery && bValue !== normalizedQuery) return -1;
    if (bValue === normalizedQuery && aValue !== normalizedQuery) return 1;

    // Starts with query gets second priority
    if (aValue.startsWith(normalizedQuery) && !bValue.startsWith(normalizedQuery)) return -1;
    if (bValue.startsWith(normalizedQuery) && !aValue.startsWith(normalizedQuery)) return 1;

    // Contains query gets third priority (already filtered)
    return 0;
  });
}

/**
 * Debounce search function to avoid excessive filtering
 * Useful for real-time search as user types
 */
export function createDebouncedSearch<T>(
  searchFn: (query: string) => T[],
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout;

  return (query: string, callback: (results: T[]) => void) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const results = searchFn(query);
      callback(results);
    }, delay);
  };
}
