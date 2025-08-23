/**
 * Contract Statistics Business Logic Hooks
 * Handles contract statistics calculations and analytics
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Contract } from '../../types/entities/contract.types';
import { DashboardStats } from '../../types/services/contract.service.types';
import { ContractStatsService } from '../../services/contracts/contract-stats.service';
import { errorService } from '../../services/shared/error.service';
import { EnhancedError, ErrorContext } from '../../types/entities/error.types';

// Hook return types
export interface UseContractDashboardStatsResult {
  stats: DashboardStats | null;
  loading: boolean;
  error: EnhancedError | null;
  userMessage: string | null;
  refetch: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export interface UseContractValueResult {
  calculateValue: (contract: Contract) => number;
  calculateTotalValue: (contracts: Contract[]) => number;
  calculateAverageValue: (contracts: Contract[]) => number;
}

export interface UseContractAnalyticsResult {
  getStatusDistribution: (contracts: Contract[]) => Record<string, number>;
  getValueRangeDistribution: (contracts: Contract[]) => Record<string, number>;
  getTopClientsByValue: (contracts: Contract[], limit?: number) => Array<{ client: string; totalValue: number; contractCount: number }>;
  calculateYearOverYearGrowth: (contracts: Contract[]) => number;
  getExpiringContracts: (contracts: Contract[], daysAhead?: number) => Contract[];
  calculateCompletionPercentage: (contract: Contract) => number;
  calculatePaymentCompletionRate: (contract: Contract) => number;
  calculateAverageContractDuration: (contracts: Contract[]) => number;
}

export interface UseMonthlyRevenueResult {
  monthlyRevenue: number;
  loading: boolean;
  error: EnhancedError | null;
  userMessage: string | null;
  calculateRevenue: (contracts: Contract[]) => number;
  refetch: () => Promise<void>;
  clearError: () => void;
}

// Hook options
export interface UseContractStatsOptions {
  autoFetch?: boolean;
  refreshInterval?: number;
  cacheKey?: string;
}

/**
 * Hook for contract dashboard statistics
 */
export function useContractDashboardStats(options: UseContractStatsOptions = {}): UseContractDashboardStatsResult {
  const { autoFetch = true, refreshInterval, cacheKey } = options;
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<EnhancedError | null>(null);
  const [userMessage, setUserMessage] = useState<string | null>(null);
  
  const contractStatsService = useRef(new ContractStatsService()).current;
  const cache = useRef(new Map<string, { data: DashboardStats; timestamp: number }>()).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

  const createErrorContext = useCallback((): ErrorContext => ({
    component: 'useContractDashboardStats',
    action: 'fetchStats',
    metadata: { cacheKey, autoFetch, refreshInterval }
  }), [cacheKey, autoFetch, refreshInterval]);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setUserMessage(null);

      // Check cache first
      const key = cacheKey || 'dashboard-stats';
      const cached = cache.get(key);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < CACHE_DURATION) {
        setStats(cached.data);
        setLoading(false);
        return;
      }

      const result = await contractStatsService.getContractDashboardStats();
      
      // Update cache
      cache.set(key, { data: result, timestamp: now });
      setStats(result);
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
  }, [contractStatsService, cache, cacheKey, createErrorContext]);

  const refresh = useCallback(async () => {
    // Clear cache and refetch
    if (cacheKey) {
      cache.delete(cacheKey);
    } else {
      cache.clear();
    }
    await fetchStats();
  }, [fetchStats, cache, cacheKey]);

  const clearError = useCallback(() => {
    setError(null);
    setUserMessage(null);
  }, []);

  // Set up auto-refresh interval
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchStats();
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refreshInterval, fetchStats]);

  useEffect(() => {
    if (autoFetch) {
      fetchStats();
    }
  }, [autoFetch, fetchStats]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    stats,
    loading,
    error,
    userMessage,
    refetch: fetchStats,
    refresh,
    clearError,
  };
}

/**
 * Hook for contract value calculations
 */
export function useContractValue(): UseContractValueResult {
  const contractStatsService = useRef(new ContractStatsService()).current;

  const calculateValue = useCallback((contract: Contract): number => {
    return contractStatsService.calculateContractValue(contract);
  }, [contractStatsService]);

  const calculateTotalValue = useCallback((contracts: Contract[]): number => {
    return contracts.reduce((total, contract) => {
      return total + contractStatsService.calculateContractValue(contract);
    }, 0);
  }, [contractStatsService]);

  const calculateAverageValue = useCallback((contracts: Contract[]): number => {
    if (contracts.length === 0) return 0;
    const totalValue = calculateTotalValue(contracts);
    return totalValue / contracts.length;
  }, [calculateTotalValue]);

  return {
    calculateValue,
    calculateTotalValue,
    calculateAverageValue,
  };
}

/**
 * Hook for contract analytics and insights
 */
export function useContractAnalytics(): UseContractAnalyticsResult {
  const contractStatsService = useRef(new ContractStatsService()).current;

  const getStatusDistribution = useCallback((contracts: Contract[]): Record<string, number> => {
    return contractStatsService.getStatusDistribution(contracts);
  }, [contractStatsService]);

  const getValueRangeDistribution = useCallback((contracts: Contract[]): Record<string, number> => {
    return contractStatsService.getContractsByValueRange(contracts);
  }, [contractStatsService]);

  const getTopClientsByValue = useCallback((contracts: Contract[], limit: number = 5) => {
    return contractStatsService.getTopClientsByValue(contracts, limit);
  }, [contractStatsService]);

  const calculateYearOverYearGrowth = useCallback((contracts: Contract[]): number => {
    return contractStatsService.calculateYearOverYearGrowth(contracts);
  }, [contractStatsService]);

  const getExpiringContracts = useCallback((contracts: Contract[], daysAhead: number = 30): Contract[] => {
    return contractStatsService.getExpiringContracts(contracts, daysAhead);
  }, [contractStatsService]);

  const calculateCompletionPercentage = useCallback((contract: Contract): number => {
    return contractStatsService.calculateCompletionPercentage(contract);
  }, [contractStatsService]);

  const calculatePaymentCompletionRate = useCallback((contract: Contract): number => {
    return contractStatsService.calculatePaymentCompletionRate(contract);
  }, [contractStatsService]);

  const calculateAverageContractDuration = useCallback((contracts: Contract[]): number => {
    return contractStatsService.calculateAverageContractDuration(contracts);
  }, [contractStatsService]);

  return {
    getStatusDistribution,
    getValueRangeDistribution,
    getTopClientsByValue,
    calculateYearOverYearGrowth,
    getExpiringContracts,
    calculateCompletionPercentage,
    calculatePaymentCompletionRate,
    calculateAverageContractDuration,
  };
}

/**
 * Hook for monthly revenue calculations
 */
export function useMonthlyRevenue(contracts?: Contract[]): UseMonthlyRevenueResult {
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<EnhancedError | null>(null);
  
  const contractStatsService = useRef(new ContractStatsService()).current;

  const calculateRevenue = useCallback((contractsToCalculate: Contract[]): number => {
    return contractStatsService.calculateMonthlyRevenue(contractsToCalculate);
  }, [contractStatsService]);

  const refetch = useCallback(async () => {
    if (!contracts) return;

    try {
      setLoading(true);
      setError(null);
      
      const revenue = calculateRevenue(contracts);
      setMonthlyRevenue(revenue);
    } catch (err) {
      const enhancedError = errorService.handleError(err as Error);
      setError(enhancedError);
      console.error('Error calculating monthly revenue:', enhancedError);
    } finally {
      setLoading(false);
    }
  }, [contracts, calculateRevenue]);

  useEffect(() => {
    if (contracts) {
      refetch();
    }
  }, [contracts, refetch]);

  return {
    monthlyRevenue,
    loading,
    error,
    calculateRevenue,
    refetch,
  };
}

/**
 * Hook for real-time contract statistics with subscription
 */
export function useContractStatsSubscription(): UseContractDashboardStatsResult {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const contractStatsService = useRef(new ContractStatsService()).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      const result = await contractStatsService.getContractDashboardStats();
      setStats(result);
      setLoading(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch contract statistics');
      setError(error);
      setLoading(false);
      console.error('Error fetching contract stats:', error);
    }
  }, [contractStatsService]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    // Initial fetch
    fetchStats();

    // Set up polling for real-time updates (every 30 seconds)
    intervalRef.current = setInterval(() => {
      fetchStats();
    }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
    refresh,
  };
}

/**
 * Hook for contract performance metrics
 */
export function useContractPerformance(contracts: Contract[]) {
  const contractStatsService = useRef(new ContractStatsService()).current;

  const metrics = useCallback(() => {
    if (!contracts || contracts.length === 0) {
      return {
        averageDuration: 0,
        completionRate: 0,
        onTimeDeliveryRate: 0,
        averagePaymentDelay: 0,
        changeOrderRate: 0,
      };
    }

    const averageDuration = contractStatsService.calculateAverageContractDuration(contracts);
    
    const completedContracts = contracts.filter(c => c.status === '已完成');
    const completionRate = contracts.length > 0 ? (completedContracts.length / contracts.length) * 100 : 0;
    
    // Calculate on-time delivery rate
    const onTimeContracts = completedContracts.filter(contract => {
      const endDate = contract.endDate instanceof Date ? contract.endDate : new Date(contract.endDate);
      const actualEndDate = contract.updatedAt instanceof Date ? contract.updatedAt : new Date(contract.updatedAt);
      return actualEndDate <= endDate;
    });
    const onTimeDeliveryRate = completedContracts.length > 0 ? (onTimeContracts.length / completedContracts.length) * 100 : 0;
    
    // Calculate average payment delay
    let totalDelayDays = 0;
    let delayedPayments = 0;
    
    contracts.forEach(contract => {
      if (contract.payments) {
        contract.payments.forEach(payment => {
          if (payment.paidDate && payment.requestDate) {
            const requestDate = payment.requestDate instanceof Date ? payment.requestDate : new Date(payment.requestDate);
            const paidDate = payment.paidDate instanceof Date ? payment.paidDate : new Date(payment.paidDate);
            const delayDays = Math.ceil((paidDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (delayDays > 0) {
              totalDelayDays += delayDays;
              delayedPayments++;
            }
          }
        });
      }
    });
    
    const averagePaymentDelay = delayedPayments > 0 ? totalDelayDays / delayedPayments : 0;
    
    // Calculate change order rate
    const contractsWithChangeOrders = contracts.filter(c => c.changeOrders && c.changeOrders.length > 0);
    const changeOrderRate = contracts.length > 0 ? (contractsWithChangeOrders.length / contracts.length) * 100 : 0;

    return {
      averageDuration,
      completionRate: Math.round(completionRate),
      onTimeDeliveryRate: Math.round(onTimeDeliveryRate),
      averagePaymentDelay: Math.round(averagePaymentDelay),
      changeOrderRate: Math.round(changeOrderRate),
    };
  }, [contracts, contractStatsService]);

  return metrics();
}