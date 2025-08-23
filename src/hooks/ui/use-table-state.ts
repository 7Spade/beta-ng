/**
 * Table State Management Hooks
 * Handles table-related UI state like sorting, filtering, pagination, and selection
 */

import { useState, useCallback, useMemo } from 'react';
import { EnhancedError, ErrorContext } from '../../types/entities/error.types';
import { errorService } from '../../services/shared/error.service';
import { useErrorHandling } from './use-error-handling';

// Types for table state management
export interface SortConfig<T = any> {
  key: keyof T | null;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

export interface FilterConfig<T = any> {
  [key: string]: any;
}

export interface SelectionConfig<T = any> {
  selectedItems: T[];
  selectedIds: Set<string>;
  isAllSelected: boolean;
  isIndeterminate: boolean;
}

// Hook return types
export interface UseTableStateResult<T = any> {
  // Sorting
  sortConfig: SortConfig<T>;
  setSortConfig: (config: SortConfig<T>) => void;
  handleSort: (key: keyof T) => void;
  getSortedData: (data: T[]) => T[];
  
  // Filtering
  filters: FilterConfig<T>;
  setFilters: (filters: FilterConfig<T>) => void;
  updateFilter: (key: string, value: any) => void;
  clearFilter: (key: string) => void;
  clearAllFilters: () => void;
  getFilteredData: (data: T[]) => T[];
  
  // Pagination
  pagination: PaginationConfig;
  setPagination: (config: Partial<PaginationConfig>) => void;
  goToPage: (page: number) => void;
  changePageSize: (pageSize: number) => void;
  getPaginatedData: (data: T[]) => T[];
  
  // Selection
  selection: SelectionConfig<T>;
  toggleSelection: (item: T, getId: (item: T) => string) => void;
  toggleAllSelection: (items: T[], getId: (item: T) => string) => void;
  clearSelection: () => void;
  isSelected: (item: T, getId: (item: T) => string) => boolean;
  
  // Error handling
  error: EnhancedError | null;
  userMessage: string | null;
  hasError: boolean;
  clearError: () => void;
  
  // Combined operations
  getProcessedData: (data: T[]) => T[];
  reset: () => void;
}

export interface UseTableSortResult<T = any> {
  sortConfig: SortConfig<T>;
  handleSort: (key: keyof T) => void;
  getSortedData: (data: T[]) => T[];
  reset: () => void;
}

export interface UseTableFilterResult<T = any> {
  filters: FilterConfig<T>;
  setFilters: (filters: FilterConfig<T>) => void;
  updateFilter: (key: string, value: any) => void;
  clearFilter: (key: string) => void;
  clearAllFilters: () => void;
  getFilteredData: (data: T[]) => T[];
  hasActiveFilters: boolean;
}

export interface UseTablePaginationResult {
  pagination: PaginationConfig;
  setPagination: (config: Partial<PaginationConfig>) => void;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  changePageSize: (pageSize: number) => void;
  getPaginatedData: <T>(data: T[]) => T[];
  canGoNext: boolean;
  canGoPrevious: boolean;
  totalPages: number;
  startIndex: number;
  endIndex: number;
}

export interface UseTableSelectionResult<T = any> {
  selection: SelectionConfig<T>;
  toggleSelection: (item: T, getId: (item: T) => string) => void;
  toggleAllSelection: (items: T[], getId: (item: T) => string) => void;
  selectItems: (items: T[], getId: (item: T) => string) => void;
  deselectItems: (items: T[], getId: (item: T) => string) => void;
  clearSelection: () => void;
  isSelected: (item: T, getId: (item: T) => string) => boolean;
  getSelectedItems: () => T[];
  getSelectedIds: () => string[];
  selectedCount: number;
}

// Hook options
export interface UseTableStateOptions<T = any> {
  initialSort?: SortConfig<T>;
  initialFilters?: FilterConfig<T>;
  initialPagination?: Partial<PaginationConfig>;
  defaultPageSize?: number;
  componentName?: string;
  onError?: (error: EnhancedError) => void;
}

/**
 * Main table state management hook
 */
export function useTableState<T = any>(options: UseTableStateOptions<T> = {}): UseTableStateResult<T> {
  const {
    initialSort = { key: null, direction: 'asc' },
    initialFilters = {},
    initialPagination = {},
    defaultPageSize = 10,
    componentName = 'useTableState',
    onError,
  } = options;

  // Error handling
  const { handleError, clearError: clearErrorHandler, error, userMessage } = useErrorHandling({
    showToast: false,
    persistError: false,
  });

  const createErrorContext = useCallback((action: string, metadata?: any): ErrorContext => ({
    component: componentName,
    action,
    metadata
  }), [componentName]);

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(initialSort);

  // Filtering state
  const [filters, setFilters] = useState<FilterConfig<T>>(initialFilters);

  // Pagination state
  const [pagination, setPaginationState] = useState<PaginationConfig>({
    page: 1,
    pageSize: defaultPageSize,
    total: 0,
    ...initialPagination,
  });

  // Selection state
  const [selection, setSelection] = useState<SelectionConfig<T>>({
    selectedItems: [],
    selectedIds: new Set(),
    isAllSelected: false,
    isIndeterminate: false,
  });

  // Sorting functions
  const handleSort = useCallback((key: keyof T) => {
    try {
      setSortConfig(prev => ({
        key,
        direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
      }));
    } catch (err) {
      const context = createErrorContext('handleSort', { sortKey: key });
      const enhancedError = errorService.handleError(err as Error, context);
      
      handleError(enhancedError, context);
      
      if (onError) {
        onError(enhancedError);
      }
    }
  }, [createErrorContext, handleError, onError]);

  const getSortedData = useCallback((data: T[]): T[] => {
    try {
      if (!sortConfig.key) return data;

      return [...data].sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (aValue === bValue) return 0;

        let comparison = 0;
        if (aValue > bValue) comparison = 1;
        if (aValue < bValue) comparison = -1;

        return sortConfig.direction === 'desc' ? comparison * -1 : comparison;
      });
    } catch (err) {
      const context = createErrorContext('getSortedData', { 
        sortKey: sortConfig.key, 
        sortDirection: sortConfig.direction,
        dataLength: data.length 
      });
      const enhancedError = errorService.handleError(err as Error, context);
      
      handleError(enhancedError, context);
      
      if (onError) {
        onError(enhancedError);
      }
      
      // Return original data on error
      return data;
    }
  }, [sortConfig, createErrorContext, handleError, onError]);

  // Filtering functions
  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    // Reset to first page when filtering
    setPaginationState(prev => ({ ...prev, page: 1 }));
  }, []);

  const clearFilter = useCallback((key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({});
    setPaginationState(prev => ({ ...prev, page: 1 }));
  }, []);

  const getFilteredData = useCallback((data: T[]): T[] => {
    try {
      return data.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
          if (value === null || value === undefined || value === '') return true;
          
          const itemValue = (item as any)[key];
          
          // Handle different filter types
          if (typeof value === 'string') {
            return String(itemValue).toLowerCase().includes(value.toLowerCase());
          }
          
          if (Array.isArray(value)) {
            return value.includes(itemValue);
          }
          
          if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
            return itemValue >= value.min && itemValue <= value.max;
          }
          
          return itemValue === value;
        });
      });
    } catch (err) {
      const context = createErrorContext('getFilteredData', { 
        filtersCount: Object.keys(filters).length,
        dataLength: data.length 
      });
      const enhancedError = errorService.handleError(err as Error, context);
      
      handleError(enhancedError, context);
      
      if (onError) {
        onError(enhancedError);
      }
      
      // Return original data on error
      return data;
    }
  }, [filters, createErrorContext, handleError, onError]);

  // Pagination functions
  const setPagination = useCallback((config: Partial<PaginationConfig>) => {
    setPaginationState(prev => ({ ...prev, ...config }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setPaginationState(prev => ({ ...prev, page }));
  }, []);

  const changePageSize = useCallback((pageSize: number) => {
    setPaginationState(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const getPaginatedData = useCallback(<U,>(data: U[]): U[] => {
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return data.slice(startIndex, endIndex);
  }, [pagination]);

  // Selection functions
  const toggleSelection = useCallback((item: T, getId: (item: T) => string) => {
    const id = getId(item);
    setSelection(prev => {
      const newSelectedIds = new Set(prev.selectedIds);
      let newSelectedItems = [...prev.selectedItems];

      if (newSelectedIds.has(id)) {
        newSelectedIds.delete(id);
        newSelectedItems = newSelectedItems.filter(selectedItem => getId(selectedItem) !== id);
      } else {
        newSelectedIds.add(id);
        newSelectedItems.push(item);
      }

      return {
        selectedItems: newSelectedItems,
        selectedIds: newSelectedIds,
        isAllSelected: false,
        isIndeterminate: newSelectedIds.size > 0,
      };
    });
  }, []);

  const toggleAllSelection = useCallback((items: T[], getId: (item: T) => string) => {
    setSelection(prev => {
      const allIds = new Set(items.map(getId));
      const isAllCurrentlySelected = items.every(item => prev.selectedIds.has(getId(item)));

      if (isAllCurrentlySelected) {
        // Deselect all current items
        const newSelectedIds = new Set(prev.selectedIds);
        const newSelectedItems = prev.selectedItems.filter(item => !allIds.has(getId(item)));
        
        allIds.forEach(id => newSelectedIds.delete(id));

        return {
          selectedItems: newSelectedItems,
          selectedIds: newSelectedIds,
          isAllSelected: false,
          isIndeterminate: newSelectedIds.size > 0,
        };
      } else {
        // Select all current items
        const newSelectedIds = new Set(Array.from(prev.selectedIds).concat(Array.from(allIds)));
        const existingIds = new Set(prev.selectedItems.map(getId));
        const newItems = items.filter(item => !existingIds.has(getId(item)));
        const newSelectedItems = [...prev.selectedItems, ...newItems];

        return {
          selectedItems: newSelectedItems,
          selectedIds: newSelectedIds,
          isAllSelected: items.length > 0,
          isIndeterminate: false,
        };
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelection({
      selectedItems: [],
      selectedIds: new Set(),
      isAllSelected: false,
      isIndeterminate: false,
    });
  }, []);

  const isSelected = useCallback((item: T, getId: (item: T) => string) => {
    return selection.selectedIds.has(getId(item));
  }, [selection.selectedIds]);

  // Combined data processing
  const getProcessedData = useCallback((data: T[]): T[] => {
    try {
      let processedData = data;
      
      // Apply filters
      processedData = getFilteredData(processedData);
      
      // Update total count for pagination
      setPaginationState(prev => ({ ...prev, total: processedData.length }));
      
      // Apply sorting
      processedData = getSortedData(processedData);
      
      // Apply pagination
      processedData = getPaginatedData(processedData);
      
      return processedData;
    } catch (err) {
      const context = createErrorContext('getProcessedData', { 
        originalDataLength: data.length,
        hasFilters: Object.keys(filters).length > 0,
        hasSorting: !!sortConfig.key,
        currentPage: pagination.page
      });
      const enhancedError = errorService.handleError(err as Error, context);
      
      handleError(enhancedError, context);
      
      if (onError) {
        onError(enhancedError);
      }
      
      // Return original data on error
      return data;
    }
  }, [getFilteredData, getSortedData, getPaginatedData, createErrorContext, handleError, onError, filters, sortConfig.key, pagination.page]);

  // Reset all state
  const reset = useCallback(() => {
    try {
      setSortConfig(initialSort);
      setFilters(initialFilters);
      setPaginationState({
        page: 1,
        pageSize: defaultPageSize,
        total: 0,
        ...initialPagination,
      });
      clearSelection();
      clearErrorHandler();
    } catch (err) {
      const context = createErrorContext('reset');
      const enhancedError = errorService.handleError(err as Error, context);
      
      handleError(enhancedError, context);
      
      if (onError) {
        onError(enhancedError);
      }
    }
  }, [initialSort, initialFilters, initialPagination, defaultPageSize, clearSelection, clearErrorHandler, createErrorContext, handleError, onError]);

  const clearError = useCallback(() => {
    clearErrorHandler();
  }, [clearErrorHandler]);

  return {
    // Sorting
    sortConfig,
    setSortConfig,
    handleSort,
    getSortedData,
    
    // Filtering
    filters,
    setFilters,
    updateFilter,
    clearFilter,
    clearAllFilters,
    getFilteredData,
    
    // Pagination
    pagination,
    setPagination,
    goToPage,
    changePageSize,
    getPaginatedData,
    
    // Selection
    selection,
    toggleSelection,
    toggleAllSelection,
    clearSelection,
    isSelected,
    
    // Error handling
    error,
    userMessage,
    hasError: !!error,
    clearError,
    
    // Combined
    getProcessedData,
    reset,
  };
}

/**
 * Hook for table sorting only
 */
export function useTableSort<T = any>(initialSort?: SortConfig<T>): UseTableSortResult<T> {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(
    initialSort || { key: null, direction: 'asc' }
  );

  const handleSort = useCallback((key: keyof T) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const getSortedData = useCallback((data: T[]): T[] => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue === bValue) return 0;

      let comparison = 0;
      if (aValue > bValue) comparison = 1;
      if (aValue < bValue) comparison = -1;

      return sortConfig.direction === 'desc' ? comparison * -1 : comparison;
    });
  }, [sortConfig]);

  const reset = useCallback(() => {
    setSortConfig(initialSort || { key: null, direction: 'asc' });
  }, [initialSort]);

  return {
    sortConfig,
    handleSort,
    getSortedData,
    reset,
  };
}

/**
 * Hook for table filtering only
 */
export function useTableFilter<T = any>(initialFilters: FilterConfig<T> = {}): UseTableFilterResult<T> {
  const [filters, setFilters] = useState<FilterConfig<T>>(initialFilters);

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilter = useCallback((key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({});
  }, []);

  const getFilteredData = useCallback((data: T[]): T[] => {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === null || value === undefined || value === '') return true;
        
        const itemValue = (item as any)[key];
        
        if (typeof value === 'string') {
          return String(itemValue).toLowerCase().includes(value.toLowerCase());
        }
        
        if (Array.isArray(value)) {
          return value.includes(itemValue);
        }
        
        if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
          return itemValue >= value.min && itemValue <= value.max;
        }
        
        return itemValue === value;
      });
    });
  }, [filters]);

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => 
      value !== null && value !== undefined && value !== ''
    );
  }, [filters]);

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilter,
    clearAllFilters,
    getFilteredData,
    hasActiveFilters,
  };
}

/**
 * Hook for table pagination only
 */
export function useTablePagination(
  initialConfig: Partial<PaginationConfig> = {},
  defaultPageSize: number = 10
): UseTablePaginationResult {
  const [pagination, setPaginationState] = useState<PaginationConfig>({
    page: 1,
    pageSize: defaultPageSize,
    total: 0,
    ...initialConfig,
  });

  const setPagination = useCallback((config: Partial<PaginationConfig>) => {
    setPaginationState(prev => ({ ...prev, ...config }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setPaginationState(prev => ({ ...prev, page }));
  }, []);

  const goToNextPage = useCallback(() => {
    setPaginationState(prev => ({ 
      ...prev, 
      page: Math.min(prev.page + 1, Math.ceil(prev.total / prev.pageSize))
    }));
  }, []);

  const goToPreviousPage = useCallback(() => {
    setPaginationState(prev => ({ ...prev, page: Math.max(prev.page - 1, 1) }));
  }, []);

  const goToFirstPage = useCallback(() => {
    setPaginationState(prev => ({ ...prev, page: 1 }));
  }, []);

  const goToLastPage = useCallback(() => {
    setPaginationState(prev => ({ 
      ...prev, 
      page: Math.ceil(prev.total / prev.pageSize) 
    }));
  }, []);

  const changePageSize = useCallback((pageSize: number) => {
    setPaginationState(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const getPaginatedData = useCallback(<U,>(data: U[]): U[] => {
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return data.slice(startIndex, endIndex);
  }, [pagination]);

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
  const canGoNext = pagination.page < totalPages;
  const canGoPrevious = pagination.page > 1;
  const startIndex = (pagination.page - 1) * pagination.pageSize;
  const endIndex = Math.min(startIndex + pagination.pageSize, pagination.total);

  return {
    pagination,
    setPagination,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    changePageSize,
    getPaginatedData,
    canGoNext,
    canGoPrevious,
    totalPages,
    startIndex,
    endIndex,
  };
}

/**
 * Hook for table selection only
 */
export function useTableSelection<T = any>(): UseTableSelectionResult<T> {
  const [selection, setSelection] = useState<SelectionConfig<T>>({
    selectedItems: [],
    selectedIds: new Set(),
    isAllSelected: false,
    isIndeterminate: false,
  });

  const toggleSelection = useCallback((item: T, getId: (item: T) => string) => {
    const id = getId(item);
    setSelection(prev => {
      const newSelectedIds = new Set(prev.selectedIds);
      let newSelectedItems = [...prev.selectedItems];

      if (newSelectedIds.has(id)) {
        newSelectedIds.delete(id);
        newSelectedItems = newSelectedItems.filter(selectedItem => getId(selectedItem) !== id);
      } else {
        newSelectedIds.add(id);
        newSelectedItems.push(item);
      }

      return {
        selectedItems: newSelectedItems,
        selectedIds: newSelectedIds,
        isAllSelected: false,
        isIndeterminate: newSelectedIds.size > 0,
      };
    });
  }, []);

  const toggleAllSelection = useCallback((items: T[], getId: (item: T) => string) => {
    setSelection(prev => {
      const allIds = new Set(items.map(getId));
      const isAllCurrentlySelected = items.every(item => prev.selectedIds.has(getId(item)));

      if (isAllCurrentlySelected) {
        const newSelectedIds = new Set(prev.selectedIds);
        const newSelectedItems = prev.selectedItems.filter(item => !allIds.has(getId(item)));
        
        allIds.forEach(id => newSelectedIds.delete(id));

        return {
          selectedItems: newSelectedItems,
          selectedIds: newSelectedIds,
          isAllSelected: false,
          isIndeterminate: newSelectedIds.size > 0,
        };
      } else {
        const newSelectedIds = new Set(Array.from(prev.selectedIds).concat(Array.from(allIds)));
        const existingIds = new Set(prev.selectedItems.map(getId));
        const newItems = items.filter(item => !existingIds.has(getId(item)));
        const newSelectedItems = [...prev.selectedItems, ...newItems];

        return {
          selectedItems: newSelectedItems,
          selectedIds: newSelectedIds,
          isAllSelected: items.length > 0,
          isIndeterminate: false,
        };
      }
    });
  }, []);

  const selectItems = useCallback((items: T[], getId: (item: T) => string) => {
    setSelection(prev => {
      const newIds = items.map(getId);
      const newSelectedIds = new Set(Array.from(prev.selectedIds).concat(newIds));
      const existingIds = new Set(prev.selectedItems.map(getId));
      const newItems = items.filter(item => !existingIds.has(getId(item)));
      const newSelectedItems = [...prev.selectedItems, ...newItems];

      return {
        selectedItems: newSelectedItems,
        selectedIds: newSelectedIds,
        isAllSelected: false,
        isIndeterminate: newSelectedIds.size > 0,
      };
    });
  }, []);

  const deselectItems = useCallback((items: T[], getId: (item: T) => string) => {
    setSelection(prev => {
      const idsToRemove = new Set(items.map(getId));
      const newSelectedIds = new Set(prev.selectedIds);
      const newSelectedItems = prev.selectedItems.filter(item => {
        const id = getId(item);
        if (idsToRemove.has(id)) {
          newSelectedIds.delete(id);
          return false;
        }
        return true;
      });

      return {
        selectedItems: newSelectedItems,
        selectedIds: newSelectedIds,
        isAllSelected: false,
        isIndeterminate: newSelectedIds.size > 0,
      };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelection({
      selectedItems: [],
      selectedIds: new Set(),
      isAllSelected: false,
      isIndeterminate: false,
    });
  }, []);

  const isSelected = useCallback((item: T, getId: (item: T) => string) => {
    return selection.selectedIds.has(getId(item));
  }, [selection.selectedIds]);

  const getSelectedItems = useCallback(() => {
    return selection.selectedItems;
  }, [selection.selectedItems]);

  const getSelectedIds = useCallback(() => {
    return Array.from(selection.selectedIds);
  }, [selection.selectedIds]);

  return {
    selection,
    toggleSelection,
    toggleAllSelection,
    selectItems,
    deselectItems,
    clearSelection,
    isSelected,
    getSelectedItems,
    getSelectedIds,
    selectedCount: selection.selectedItems.length,
  };
}