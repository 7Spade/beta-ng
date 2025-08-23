/**
 * Contract Data Hooks
 * Handles contract data fetching, caching, and state management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Contract, ContractFilters, ContractStats } from '../../types/entities/contract.types';
import { ContractRepository } from '../../repositories/contracts/contract.repository';
import { PaginationOptions } from '../../types/entities/shared.types';
import { errorService } from '../../services/shared/error.service';
import { EnhancedError, ErrorContext } from '../../types/entities/error.types';

// Hook return types
export interface UseContractsResult {
  contracts: Contract[];
  loading: boolean;
  error: EnhancedError | null;
  userMessage: string | null;
  hasError: boolean;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export interface UseContractsWithFiltersResult extends UseContractsResult {
  total: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export interface UseContractResult {
  contract: Contract | null;
  loading: boolean;
  error: EnhancedError | null;
  userMessage: string | null;
  hasError: boolean;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export interface UseContractStatsResult {
  stats: ContractStats | null;
  loading: boolean;
  error: EnhancedError | null;
  userMessage: string | null;
  hasError: boolean;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export interface UseContractSubscriptionResult {
  contracts: Contract[];
  loading: boolean;
  error: EnhancedError | null;
  userMessage: string | null;
  hasError: boolean;
  unsubscribe: () => void;
  clearError: () => void;
}

// Hook options
export interface UseContractsOptions {
  filters?: ContractFilters;
  pagination?: PaginationOptions;
  autoFetch?: boolean;
  cacheKey?: string;
}

export interface UseContractSubscriptionOptions {
  filters?: ContractFilters;
  autoStart?: boolean;
}

/**
 * Hook for fetching all contracts
 */
export function useContracts(options: UseContractsOptions = {}): UseContractsResult {
  const { autoFetch = true, cacheKey } = options;
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<EnhancedError | null>(null);
  const [userMessage, setUserMessage] = useState<string | null>(null);

  const contractRepository = useRef(new ContractRepository()).current;
  const cache = useRef(new Map<string, { data: Contract[]; timestamp: number }>()).current;
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const createErrorContext = useCallback((): ErrorContext => ({
    component: 'useContracts',
    action: 'fetchContracts',
    metadata: { cacheKey, autoFetch }
  }), [cacheKey, autoFetch]);

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setUserMessage(null);

      // Check cache first
      const key = cacheKey || 'all-contracts';
      const cached = cache.get(key);
      const now = Date.now();

      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        setContracts(cached.data);
        setLoading(false);
        return;
      }

      const result = await contractRepository.findAll();

      // Update cache
      cache.set(key, { data: result, timestamp: now });
      setContracts(result);
    } catch (err) {
      const context = createErrorContext();
      const enhancedError = errorService.handleError(err as Error, context);

      setError(enhancedError);
      setUserMessage(errorService.formatErrorMessage(enhancedError));

      // Log the error
      errorService.logError(enhancedError);
    } finally {
      setLoading(false);
    }
  }, [contractRepository, cache, cacheKey, createErrorContext]);

  const refresh = useCallback(async () => {
    // Clear cache and refetch
    if (cacheKey) {
      cache.delete(cacheKey);
    } else {
      cache.clear();
    }
    await fetchContracts();
  }, [fetchContracts, cache, cacheKey]);

  const clearError = useCallback(() => {
    setError(null);
    setUserMessage(null);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchContracts();
    }
  }, [autoFetch, fetchContracts]);

  return {
    contracts,
    loading,
    error,
    userMessage,
    hasError: !!error,
    refetch: fetchContracts,
    refresh,
    clearError,
  };
}

/**
 * Hook for fetching contracts with filters and pagination
 */
export function useContractsWithFilters(options: UseContractsOptions = {}): UseContractsWithFiltersResult {
  const { filters, pagination, autoFetch = true, cacheKey } = options;
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<EnhancedError | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const contractRepository = useRef(new ContractRepository()).current;
  const cache = useRef(new Map<string, { data: Contract[]; total: number; timestamp: number }>()).current;
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const fetchContracts = useCallback(async (append = false) => {
    try {
      setLoading(true);
      setError(null);

      // Generate cache key based on filters and pagination
      const key = cacheKey || `contracts-${JSON.stringify({ filters, pagination })}`;
      const cached = cache.get(key);
      const now = Date.now();

      if (!append && cached && (now - cached.timestamp) < CACHE_DURATION) {
        setContracts(cached.data);
        setTotal(cached.total);
        setHasMore(cached.data.length < cached.total);
        setLoading(false);
        return;
      }

      const result = filters
        ? await contractRepository.findContracts({ filters, pagination })
        : await contractRepository.findAll().then(contracts => ({ contracts, total: contracts.length }));

      if (append) {
        setContracts(prev => [...prev, ...result.contracts]);
      } else {
        setContracts(result.contracts);
        // Update cache only for non-append operations
        cache.set(key, { data: result.contracts, total: result.total, timestamp: now });
      }

      setTotal(result.total);
      setHasMore(result.contracts.length < result.total);
    } catch (err) {
      const context: ErrorContext = {
        component: 'useContractsWithFilters',
        action: 'fetchContracts',
        metadata: { filters, pagination, append }
      };
      const enhancedError = errorService.handleError(err as Error, context);
      setError(enhancedError);
      console.error('Error fetching contracts with filters:', enhancedError);
    } finally {
      setLoading(false);
    }
  }, [contractRepository, filters, pagination, cache, cacheKey]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    const nextPagination = pagination ? {
      ...pagination,
      limit: pagination.limit || 10,
      // Note: For proper pagination, we'd need cursor-based pagination
      // This is a simplified implementation
    } : undefined;

    // TODO: Implement proper cursor-based pagination with nextPagination
    await fetchContracts(true);
  }, [fetchContracts, hasMore, loading, pagination]);

  const refresh = useCallback(async () => {
    // Clear cache and refetch
    if (cacheKey) {
      cache.delete(cacheKey);
    } else {
      cache.clear();
    }
    await fetchContracts(false);
  }, [fetchContracts, cache, cacheKey]);

  useEffect(() => {
    if (autoFetch) {
      fetchContracts(false);
    }
  }, [autoFetch, fetchContracts]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    contracts,
    total,
    loading,
    error,
    userMessage: error ? errorService.formatErrorMessage(error) : null,
    hasError: !!error,
    hasMore,
    refetch: () => fetchContracts(false),
    refresh,
    loadMore,
    clearError,
  };
}

/**
 * Hook for fetching a single contract by ID
 */
export function useContract(id: string | null, options: { autoFetch?: boolean } = {}): UseContractResult {
  const { autoFetch = true } = options;
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<EnhancedError | null>(null);
  const [userMessage, setUserMessage] = useState<string | null>(null);

  const contractRepository = useRef(new ContractRepository()).current;
  const cache = useRef(new Map<string, { data: Contract; timestamp: number }>()).current;
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const createErrorContext = useCallback((): ErrorContext => ({
    component: 'useContract',
    action: 'fetchContract',
    metadata: { contractId: id, autoFetch }
  }), [id, autoFetch]);

  const fetchContract = useCallback(async () => {
    if (!id) {
      setContract(null);
      setError(null);
      setUserMessage(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setUserMessage(null);

      // Check cache first
      const cached = cache.get(id);
      const now = Date.now();

      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        setContract(cached.data);
        setLoading(false);
        return;
      }

      const result = await contractRepository.findById(id);

      if (result) {
        // Update cache
        cache.set(id, { data: result, timestamp: now });
        setContract(result);
      } else {
        // Handle not found case
        const context = createErrorContext();
        const notFoundError = errorService.createNotFoundError('合約', id, context);

        setError(notFoundError);
        setUserMessage(errorService.formatErrorMessage(notFoundError));
        setContract(null);

        // Log the error
        errorService.logError(notFoundError);
      }
    } catch (err) {
      const context = createErrorContext();
      const enhancedError = errorService.handleError(err as Error, context);

      setError(enhancedError);
      setUserMessage(errorService.formatErrorMessage(enhancedError));

      // Log the error
      errorService.logError(enhancedError);
    } finally {
      setLoading(false);
    }
  }, [id, contractRepository, cache, createErrorContext]);

  const clearError = useCallback(() => {
    setError(null);
    setUserMessage(null);
  }, []);

  useEffect(() => {
    if (autoFetch && id) {
      fetchContract();
    } else if (!id) {
      setContract(null);
      setError(null);
      setUserMessage(null);
    }
  }, [autoFetch, id, fetchContract]);

  return {
    contract,
    loading,
    error,
    userMessage,
    hasError: !!error,
    refetch: fetchContract,
    clearError,
  };
}

/**
 * Hook for fetching contract statistics
 */
export function useContractStats(options: { autoFetch?: boolean; cacheKey?: string } = {}): UseContractStatsResult {
  const { autoFetch = true, cacheKey } = options;
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<EnhancedError | null>(null);
  const [userMessage, setUserMessage] = useState<string | null>(null);

  const contractRepository = useRef(new ContractRepository()).current;
  const cache = useRef(new Map<string, { data: ContractStats; timestamp: number }>()).current;
  const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes (stats change more frequently)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const key = cacheKey || 'contract-stats';
      const cached = cache.get(key);
      const now = Date.now();

      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        setStats(cached.data);
        setLoading(false);
        return;
      }

      const result = await contractRepository.getContractStats();

      // Update cache
      cache.set(key, { data: result, timestamp: now });
      setStats(result);
    } catch (err) {
      const context: ErrorContext = {
        component: 'useContractStats',
        action: 'fetchStats',
        metadata: { cacheKey }
      };
      const enhancedError = errorService.handleError(err as Error, context);
      setError(enhancedError);
      setUserMessage(errorService.formatErrorMessage(enhancedError));
      console.error('Error fetching contract stats:', enhancedError);
    } finally {
      setLoading(false);
    }
  }, [contractRepository, cache, cacheKey]);

  useEffect(() => {
    if (autoFetch) {
      fetchStats();
    }
  }, [autoFetch, fetchStats]);

  const clearError = useCallback(() => {
    setError(null);
    setUserMessage(null);
  }, []);

  return {
    stats,
    loading,
    error,
    userMessage,
    hasError: !!error,
    refetch: fetchStats,
    clearError,
  };
}

/**
 * Hook for real-time contract subscription
 */
export function useContractSubscription(options: UseContractSubscriptionOptions = {}): UseContractSubscriptionResult {
  const { filters, autoStart = true } = options;
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<EnhancedError | null>(null);
  const [userMessage, setUserMessage] = useState<string | null>(null);

  const contractRepository = useRef(new ContractRepository()).current;
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const startSubscription = useCallback(() => {
    try {
      setLoading(true);
      setError(null);

      // Clean up existing subscription
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      // Start new subscription
      unsubscribeRef.current = contractRepository.subscribeToContracts(
        filters,
        (updatedContracts) => {
          setContracts(updatedContracts);
          setLoading(false);
        }
      );
    } catch (err) {
      const context: ErrorContext = {
        component: 'useContractSubscription',
        action: 'startSubscription',
        metadata: { filters }
      };
      const enhancedError = errorService.handleError(err as Error, context);
      setError(enhancedError);
      setUserMessage(errorService.formatErrorMessage(enhancedError));
      setLoading(false);
      console.error('Error starting contract subscription:', enhancedError);
    }
  }, [contractRepository, filters]);

  const unsubscribe = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (autoStart) {
      startSubscription();
    }

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [autoStart, startSubscription, unsubscribe]);

  const clearError = useCallback(() => {
    setError(null);
    setUserMessage(null);
  }, []);

  return {
    contracts,
    loading,
    error,
    userMessage,
    hasError: !!error,
    unsubscribe,
    clearError,
  };
}

/**
 * Hook for contracts expiring soon
 */
export function useExpiringContracts(daysAhead: number = 30): UseContractsResult {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<EnhancedError | null>(null);
  const [userMessage, setUserMessage] = useState<string | null>(null);

  const contractRepository = useRef(new ContractRepository()).current;

  const fetchExpiringContracts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await contractRepository.getExpiringContracts(daysAhead);
      setContracts(result);
    } catch (err) {
      const context: ErrorContext = {
        component: 'useExpiringContracts',
        action: 'fetchExpiringContracts',
        metadata: { daysAhead }
      };
      const enhancedError = errorService.handleError(err as Error, context);
      setError(enhancedError);
      setUserMessage(errorService.formatErrorMessage(enhancedError));
      console.error('Error fetching expiring contracts:', enhancedError);
    } finally {
      setLoading(false);
    }
  }, [contractRepository, daysAhead]);

  useEffect(() => {
    fetchExpiringContracts();
  }, [fetchExpiringContracts]);

  const clearError = useCallback(() => {
    setError(null);
    setUserMessage(null);
  }, []);

  return {
    contracts,
    loading,
    error,
    userMessage,
    hasError: !!error,
    refetch: fetchExpiringContracts,
    refresh: fetchExpiringContracts,
    clearError,
  };
}