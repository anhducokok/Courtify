/**
 * Dashboard Custom Hooks
 * 
 * Utility hooks untuk dashboard functionality
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { ChartDataPoint, RecentItem, TopPerformer } from './types';

// ============================================================================
// useFilter Hook
// ============================================================================

export function useFilter(tabs: Array<{ id: string }>, defaultTab: string = '7d') {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = useCallback((tabId: string) => {
    if (tabs.some((tab) => tab.id === tabId)) {
      setActiveTab(tabId);
    }
  }, [tabs]);

  return {
    activeTab,
    setActiveTab: handleTabChange,
  };
}

// ============================================================================
// useChartData Hook
// ============================================================================

export function useChartData(
  initialData: ChartDataPoint[],
  filter?: string
) {
  const filteredData = useMemo(() => {
    if (!filter) return initialData;
    // Add custom filtering logic here
    return initialData;
  }, [initialData, filter]);

  return filteredData;
}

// ============================================================================
// useDashboardStats Hook
// ============================================================================

interface DashboardStatsData {
  totalRevenue: number;
  activeUsers: number;
  totalCourts: number;
  bookingTrend: number;
}

export function useDashboardStats(
  initialData: DashboardStatsData,
  isLoading: boolean = false
) {
  const [stats, setStats] = useState(initialData);
  const [loading, setLoading] = useState(isLoading);

  const refetchStats = useCallback(async () => {
    setLoading(true);
    try {
      // Simulated API call
      // const response = await fetchDashboardStats();
      // setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    loading,
    refetch: refetchStats,
  };
}

// ============================================================================
// usePaginatedList Hook
// ============================================================================

interface UsePaginatedListOptions<T> {
  items: T[];
  itemsPerPage?: number;
}

export function usePaginatedList<T>({
  items,
  itemsPerPage = 10,
}: UsePaginatedListOptions<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  return {
    items: paginatedItems,
    currentPage,
    totalPages,
    goToPage: handlePageChange,
    goToNext: () => handlePageChange(currentPage + 1),
    goToPrevious: () => handlePageChange(currentPage - 1),
  };
}

// ============================================================================
// useSortableList Hook
// ============================================================================

type SortDirection = 'asc' | 'desc';

interface UseSortableListOptions<T> {
  items: T[];
  defaultSortKey?: keyof T;
  defaultDirection?: SortDirection;
}

export function useSortableList<T>({
  items,
  defaultSortKey,
  defaultDirection = 'asc',
}: UseSortableListOptions<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(defaultSortKey || null);
  const [direction, setDirection] = useState<SortDirection>(defaultDirection);

  const sortedItems = useMemo(() => {
    if (!sortKey) return items;

    const sorted = [...items].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return sorted;
  }, [items, sortKey, direction]);

  const handleSort = useCallback((key: keyof T) => {
    setSortKey(key);
    setDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  return {
    items: sortedItems,
    sortKey,
    direction,
    sort: handleSort,
  };
}

// ============================================================================
// useSearch Hook
// ============================================================================

export function useSearch<T>(
  items: T[],
  searchableFields: (keyof T)[]
) {
  const [searchTerm, setSearchTerm] = useState('');

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return items;

    const lowerSearchTerm = searchTerm.toLowerCase();

    return items.filter((item) => {
      return searchableFields.some((field) => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(lowerSearchTerm);
        }
        return false;
      });
    });
  }, [items, searchTerm, searchableFields]);

  return {
    searchTerm,
    setSearchTerm,
    results: searchResults,
  };
}

// ============================================================================
// useLocalStorage Hook
// ============================================================================

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error('Error writing to localStorage:', error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
}

// ============================================================================
// useDebounce Hook
// ============================================================================

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// useAsync Hook
// ============================================================================

interface UseAsyncOptions<T> {
  asyncFunction: () => Promise<T>;
  immediate?: boolean;
}

interface UseAsyncState<T> {
  status: 'idle' | 'pending' | 'success' | 'error';
  data: T | null;
  error: Error | null;
}

export function useAsync<T>({
  asyncFunction,
  immediate = true,
}: UseAsyncOptions<T>) {
  const [state, setState] = useState<UseAsyncState<T>>({
    status: 'idle',
    data: null,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ status: 'pending', data: null, error: null });
    try {
      const response = await asyncFunction();
      setState({ status: 'success', data: response, error: null });
    } catch (error) {
      setState({ status: 'error', data: null, error: error as Error });
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, execute };
}
