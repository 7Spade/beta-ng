/**
 * Contract Context
 * Provides global contract state management and operations
 */

import React, { createContext, useContext, useReducer, useCallback, ReactNode, useRef } from 'react';
import { Contract, ContractFilters, ContractStats } from '../../types/entities/contract.types';
import { CreateContractDto, UpdateContractDto } from '../../types/dto/contract.dto';
import { DashboardStats, ExportOptions } from '../../types/services/contract.service.types';
import { EnhancedError, ErrorContext } from '../../types/entities/error.types';
import { ContractService } from '../../services/contracts/contract.service';
import { errorService } from '../../services/shared/error.service';

// Contract state interface
export interface ContractState {
  contracts: Contract[];
  selectedContract: Contract | null;
  stats: ContractStats | null;
  dashboardStats: DashboardStats | null;
  filters: ContractFilters;
  loading: boolean;
  error: EnhancedError | null;
  userMessage: string | null;
  lastUpdated: Date | null;
}

// Contract actions
export type ContractAction =
  | { type: 'SET_LOADING'; payload: { loading: boolean } }
  | { type: 'SET_ERROR'; payload: { error: EnhancedError | null; userMessage?: string | null } }
  | { type: 'SET_CONTRACTS'; payload: { contracts: Contract[] } }
  | { type: 'ADD_CONTRACT'; payload: { contract: Contract } }
  | { type: 'UPDATE_CONTRACT'; payload: { contract: Contract } }
  | { type: 'REMOVE_CONTRACT'; payload: { contractId: string } }
  | { type: 'SELECT_CONTRACT'; payload: { contract: Contract | null } }
  | { type: 'SET_STATS'; payload: { stats: ContractStats } }
  | { type: 'SET_DASHBOARD_STATS'; payload: { dashboardStats: DashboardStats } }
  | { type: 'SET_FILTERS'; payload: { filters: ContractFilters } }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESET_STATE' };

// Contract context value interface
export interface ContractContextValue {
  // State
  contracts: Contract[];
  selectedContract: Contract | null;
  stats: ContractStats | null;
  dashboardStats: DashboardStats | null;
  filters: ContractFilters;
  loading: boolean;
  error: EnhancedError | null;
  userMessage: string | null;
  lastUpdated: Date | null;
  
  // Contract operations
  createContract: (data: CreateContractDto) => Promise<Contract>;
  updateContract: (id: string, updates: UpdateContractDto) => Promise<Contract>;
  deleteContract: (id: string) => Promise<void>;
  updateContractStatus: (id: string, status: Contract['status']) => Promise<Contract>;
  
  // Data operations
  loadContracts: (filters?: ContractFilters) => Promise<void>;
  loadContract: (id: string) => Promise<Contract | null>;
  refreshContracts: () => Promise<void>;
  loadStats: () => Promise<void>;
  loadDashboardStats: () => Promise<void>;
  
  // Selection and filtering
  selectContract: (contract: Contract | null) => void;
  setFilters: (filters: ContractFilters) => void;
  clearFilters: () => void;
  
  // Export operations
  exportContracts: (contracts: Contract[], options: ExportOptions) => Promise<void>;
  
  // Utilities
  findContract: (id: string) => Contract | undefined;
  getContractsByStatus: (status: Contract['status']) => Contract[];
  clearError: () => void;
  reset: () => void;
  
  // Computed properties
  hasContracts: boolean;
  hasError: boolean;
  activeContracts: Contract[];
  completedContracts: Contract[];
  filteredContracts: Contract[];
}

// Initial state
const initialState: ContractState = {
  contracts: [],
  selectedContract: null,
  stats: null,
  dashboardStats: null,
  filters: {},
  loading: false,
  error: null,
  userMessage: null,
  lastUpdated: null,
};

// Contract reducer
function contractReducer(state: ContractState, action: ContractAction): ContractState {
  switch (action.type) {
    case 'SET_LOADING': {
      const { loading } = action.payload;
      return {
        ...state,
        loading,
      };
    }
    
    case 'SET_ERROR': {
      const { error, userMessage } = action.payload;
      return {
        ...state,
        error,
        userMessage: userMessage || (error ? errorService.formatErrorMessage(error) : null),
        loading: false,
      };
    }
    
    case 'SET_CONTRACTS': {
      const { contracts } = action.payload;
      return {
        ...state,
        contracts,
        loading: false,
        error: null,
        userMessage: null,
        lastUpdated: new Date(),
      };
    }
    
    case 'ADD_CONTRACT': {
      const { contract } = action.payload;
      return {
        ...state,
        contracts: [...state.contracts, contract],
        lastUpdated: new Date(),
      };
    }
    
    case 'UPDATE_CONTRACT': {
      const { contract } = action.payload;
      return {
        ...state,
        contracts: state.contracts.map(c => c.id === contract.id ? contract : c),
        selectedContract: state.selectedContract?.id === contract.id ? contract : state.selectedContract,
        lastUpdated: new Date(),
      };
    }
    
    case 'REMOVE_CONTRACT': {
      const { contractId } = action.payload;
      return {
        ...state,
        contracts: state.contracts.filter(c => c.id !== contractId),
        selectedContract: state.selectedContract?.id === contractId ? null : state.selectedContract,
        lastUpdated: new Date(),
      };
    }
    
    case 'SELECT_CONTRACT': {
      const { contract } = action.payload;
      return {
        ...state,
        selectedContract: contract,
      };
    }
    
    case 'SET_STATS': {
      const { stats } = action.payload;
      return {
        ...state,
        stats,
      };
    }
    
    case 'SET_DASHBOARD_STATS': {
      const { dashboardStats } = action.payload;
      return {
        ...state,
        dashboardStats,
      };
    }
    
    case 'SET_FILTERS': {
      const { filters } = action.payload;
      return {
        ...state,
        filters,
      };
    }
    
    case 'CLEAR_FILTERS': {
      return {
        ...state,
        filters: {},
      };
    }
    
    case 'CLEAR_ERROR': {
      return {
        ...state,
        error: null,
        userMessage: null,
      };
    }
    
    case 'RESET_STATE': {
      return {
        ...initialState,
      };
    }
    
    default:
      return state;
  }
}

// Create context
const ContractContext = createContext<ContractContextValue | undefined>(undefined);

// Contract provider props
export interface ContractProviderProps {
  children: ReactNode;
  autoLoad?: boolean;
  initialFilters?: ContractFilters;
}

// Contract provider component
export function ContractProvider({ 
  children, 
  autoLoad = true,
  initialFilters = {}
}: ContractProviderProps) {
  const [state, dispatch] = useReducer(contractReducer, {
    ...initialState,
    filters: initialFilters,
  });

  const contractService = useRef(new ContractService()).current;

  const createErrorContext = useCallback((action: string, metadata?: any): ErrorContext => ({
    component: 'ContractProvider',
    action,
    metadata
  }), []);

  // Helper function to handle async operations with error handling
  const handleAsyncOperation = useCallback(async (
    action: string,
    operation: () => Promise<any>,
    metadata?: any
  ): Promise<any> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { loading: true } });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const result = await operation();
      return result;
    } catch (err) {
      const context = createErrorContext(action, metadata);
      const enhancedError = errorService.handleError(err as Error, context);
      
      dispatch({ type: 'SET_ERROR', payload: { error: enhancedError } });
      
      // Log the error
      errorService.logError(enhancedError);
      
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { loading: false } });
    }
  }, [createErrorContext]);

  // Contract operations
  const createContract = useCallback(async (data: CreateContractDto): Promise<Contract> => {
    const result = await handleAsyncOperation('createContract', async () => {
      const contract = await contractService.createContract(data);
      dispatch({ type: 'ADD_CONTRACT', payload: { contract } });
      return contract;
    }, { contractData: data });
    
    if (!result) {
      throw new Error('Failed to create contract');
    }
    
    return result;
  }, [contractService, handleAsyncOperation]);

  const updateContract = useCallback(async (id: string, updates: UpdateContractDto): Promise<Contract> => {
    const result = await handleAsyncOperation('updateContract', async () => {
      const contract = await contractService.updateContract(id, updates);
      dispatch({ type: 'UPDATE_CONTRACT', payload: { contract } });
      return contract;
    }, { contractId: id, updates });
    
    if (!result) {
      throw new Error('Failed to update contract');
    }
    
    return result;
  }, [contractService, handleAsyncOperation]);

  const deleteContract = useCallback(async (id: string): Promise<void> => {
    await handleAsyncOperation('deleteContract', async () => {
      await contractService.deleteContract(id);
      dispatch({ type: 'REMOVE_CONTRACT', payload: { contractId: id } });
    }, { contractId: id });
  }, [contractService, handleAsyncOperation]);

  const updateContractStatus = useCallback(async (id: string, status: Contract['status']): Promise<Contract> => {
    const result = await handleAsyncOperation('updateContractStatus', async () => {
      const contract = await contractService.updateContractStatus(id, status);
      dispatch({ type: 'UPDATE_CONTRACT', payload: { contract } });
      return contract;
    }, { contractId: id, newStatus: status });
    
    if (!result) {
      throw new Error('Failed to update contract status');
    }
    
    return result;
  }, [contractService, handleAsyncOperation]);

  // Data operations
  const loadContracts = useCallback(async (filters?: ContractFilters): Promise<void> => {
    await handleAsyncOperation('loadContracts', async () => {
      const contracts = await contractService.getContracts(filters);
      dispatch({ type: 'SET_CONTRACTS', payload: { contracts } });
      
      if (filters) {
        dispatch({ type: 'SET_FILTERS', payload: { filters } });
      }
    }, { filters });
  }, [contractService, handleAsyncOperation]);

  const loadContract = useCallback(async (id: string): Promise<Contract | null> => {
    return await handleAsyncOperation('loadContract', async () => {
      const contract = await contractService.getContract(id);
      if (contract) {
        // Update the contract in the list if it exists
        dispatch({ type: 'UPDATE_CONTRACT', payload: { contract } });
      }
      return contract;
    }, { contractId: id });
  }, [contractService, handleAsyncOperation]);

  const refreshContracts = useCallback(async (): Promise<void> => {
    await loadContracts(state.filters);
  }, [loadContracts]);

  const loadStats = useCallback(async (): Promise<void> => {
    await handleAsyncOperation('loadStats', async () => {
      const stats = await contractService.getContractStats(state.filters);
      dispatch({ type: 'SET_STATS', payload: { stats } });
    }, { filters: state.filters });
  }, [contractService, handleAsyncOperation]);

  const loadDashboardStats = useCallback(async (): Promise<void> => {
    await handleAsyncOperation('loadDashboardStats', async () => {
      const dashboardStats = await contractService.getContractDashboardStats();
      dispatch({ type: 'SET_DASHBOARD_STATS', payload: { dashboardStats } });
    });
  }, [contractService, handleAsyncOperation]);

  // Selection and filtering
  const selectContract = useCallback((contract: Contract | null) => {
    dispatch({ type: 'SELECT_CONTRACT', payload: { contract } });
  }, []);

  const setFilters = useCallback((filters: ContractFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: { filters } });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  // Export operations
  const exportContracts = useCallback(async (contracts: Contract[], options: ExportOptions): Promise<void> => {
    await handleAsyncOperation('exportContracts', async () => {
      await contractService.exportContracts(contracts, options);
    }, { contractCount: contracts.length, options });
  }, [contractService, handleAsyncOperation]);

  // Utilities
  const findContract = useCallback((id: string): Contract | undefined => {
    return state.contracts.find(contract => contract.id === id);
  }, [state.contracts]);

  const getContractsByStatus = useCallback((status: Contract['status']): Contract[] => {
    return state.contracts.filter(contract => contract.status === status);
  }, [state.contracts]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // Computed properties
  const hasContracts = state.contracts.length > 0;
  const hasError = !!state.error;
  const activeContracts = state.contracts.filter(contract => contract.status === '啟用中');
  const completedContracts = state.contracts.filter(contract => contract.status === '已完成');
  
  // Apply filters to get filtered contracts
  const filteredContracts = state.contracts.filter(contract => {
    const { status, client, contractor, startDate, endDate, minValue, maxValue } = state.filters;
    
    if (status && contract.status !== status) return false;
    if (client && !contract.client.toLowerCase().includes(client.toLowerCase())) return false;
    if (contractor && !contract.contractor.toLowerCase().includes(contractor.toLowerCase())) return false;
    if (startDate && contract.startDate < startDate) return false;
    if (endDate && contract.endDate > endDate) return false;
    if (minValue && contract.totalValue < minValue) return false;
    if (maxValue && contract.totalValue > maxValue) return false;
    
    return true;
  });

  // Auto-load contracts on mount
  React.useEffect(() => {
    if (autoLoad) {
      loadContracts(initialFilters);
    }
  }, [autoLoad]); // Remove loadContracts and initialFilters from dependencies to prevent infinite loop

  const contextValue: ContractContextValue = {
    // State
    contracts: state.contracts,
    selectedContract: state.selectedContract,
    stats: state.stats,
    dashboardStats: state.dashboardStats,
    filters: state.filters,
    loading: state.loading,
    error: state.error,
    userMessage: state.userMessage,
    lastUpdated: state.lastUpdated,
    
    // Contract operations
    createContract,
    updateContract,
    deleteContract,
    updateContractStatus,
    
    // Data operations
    loadContracts,
    loadContract,
    refreshContracts,
    loadStats,
    loadDashboardStats,
    
    // Selection and filtering
    selectContract,
    setFilters,
    clearFilters,
    
    // Export operations
    exportContracts,
    
    // Utilities
    findContract,
    getContractsByStatus,
    clearError,
    reset,
    
    // Computed properties
    hasContracts,
    hasError,
    activeContracts,
    completedContracts,
    filteredContracts,
  };

  return (
    <ContractContext.Provider value={contextValue}>
      {children}
    </ContractContext.Provider>
  );
}

// Hook to use contract context
export function useContractContext(): ContractContextValue {
  const context = useContext(ContractContext);
  if (context === undefined) {
    throw new Error('useContractContext must be used within a ContractProvider');
  }
  return context;
}

// Export the context for advanced usage
export { ContractContext };