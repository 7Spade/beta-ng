/**
 * Contract Actions Business Logic Hooks
 * Handles contract CRUD operations and business actions
 */

import { useState, useCallback, useRef } from 'react';
import { Contract } from '../../types/entities/contract.types';
import { CreateContractDto, UpdateContractDto } from '../../types/dto/contract.dto';
import { ExportOptions, ValidationResult } from '../../types/services/contract.service.types';
import { ContractService } from '../../services/contracts/contract.service';

// Hook return types
export interface UseContractActionsResult {
  // State
  loading: boolean;
  error: Error | null;
  
  // Actions
  createContract: (data: CreateContractDto) => Promise<Contract>;
  updateContract: (id: string, updates: UpdateContractDto) => Promise<Contract>;
  deleteContract: (id: string) => Promise<void>;
  updateContractStatus: (id: string, status: Contract['status']) => Promise<Contract>;
  validateContract: (contract: Partial<Contract>) => ValidationResult;
  exportContracts: (contracts: Contract[], options: ExportOptions) => Promise<void>;
  
  // Utilities
  clearError: () => void;
  reset: () => void;
}

export interface UseContractValidationResult {
  validateContract: (contract: Partial<Contract>) => ValidationResult;
  validateCreateContract: (data: CreateContractDto) => ValidationResult;
  validateUpdateContract: (data: UpdateContractDto) => ValidationResult;
  validateStatusTransition: (currentStatus: Contract['status'], newStatus: Contract['status']) => ValidationResult;
}

export interface UseContractExportResult {
  exporting: boolean;
  exportError: Error | null;
  exportToCSV: (contracts: Contract[], options?: Partial<ExportOptions>) => Promise<void>;
  exportToExcel: (contracts: Contract[], options?: Partial<ExportOptions>) => Promise<void>;
  exportToPDF: (contracts: Contract[], options?: Partial<ExportOptions>) => Promise<void>;
  clearExportError: () => void;
}

export interface UseContractBatchActionsResult {
  batchLoading: boolean;
  batchError: Error | null;
  batchUpdateStatus: (contractIds: string[], status: Contract['status']) => Promise<void>;
  batchDelete: (contractIds: string[]) => Promise<void>;
  batchExport: (contractIds: string[], options: ExportOptions) => Promise<void>;
  clearBatchError: () => void;
}

// Hook options
export interface UseContractActionsOptions {
  onSuccess?: (action: string, result?: any) => void;
  onError?: (action: string, error: Error) => void;
  autoReset?: boolean;
}

/**
 * Main hook for contract actions
 */
export function useContractActions(options: UseContractActionsOptions = {}): UseContractActionsResult {
  const { onSuccess, onError, autoReset = true } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const contractService = useRef(new ContractService()).current;

  const handleAction = useCallback(async <T>(
    action: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    try {
      setLoading(true);
      if (autoReset) setError(null);
      
      const result = await operation();
      
      if (onSuccess) {
        onSuccess(action, result);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to ${action}`);
      setError(error);
      
      if (onError) {
        onError(action, error);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError, autoReset]);

  const createContract = useCallback(async (data: CreateContractDto): Promise<Contract> => {
    return handleAction('create contract', () => contractService.createContract(data));
  }, [contractService, handleAction]);

  const updateContract = useCallback(async (id: string, updates: UpdateContractDto): Promise<Contract> => {
    return handleAction('update contract', () => contractService.updateContract(id, updates));
  }, [contractService, handleAction]);

  const deleteContract = useCallback(async (id: string): Promise<void> => {
    return handleAction('delete contract', () => contractService.deleteContract(id));
  }, [contractService, handleAction]);

  const updateContractStatus = useCallback(async (id: string, status: Contract['status']): Promise<Contract> => {
    return handleAction('update contract status', () => contractService.updateContractStatus(id, status));
  }, [contractService, handleAction]);

  const validateContract = useCallback((contract: Partial<Contract>): ValidationResult => {
    return contractService.validateContract(contract);
  }, [contractService]);

  const exportContracts = useCallback(async (contracts: Contract[], options: ExportOptions): Promise<void> => {
    return handleAction('export contracts', () => contractService.exportContracts(contracts, options));
  }, [contractService, handleAction]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    createContract,
    updateContract,
    deleteContract,
    updateContractStatus,
    validateContract,
    exportContracts,
    clearError,
    reset,
  };
}

/**
 * Hook for contract validation operations
 */
export function useContractValidation(): UseContractValidationResult {
  const contractService = useRef(new ContractService()).current;

  const validateContract = useCallback((contract: Partial<Contract>): ValidationResult => {
    return contractService.validateContract(contract);
  }, [contractService]);

  const validateCreateContract = useCallback((data: CreateContractDto): ValidationResult => {
    // Use the service's validation which handles CreateContractDto
    return contractService.validateContract(data);
  }, [contractService]);

  const validateUpdateContract = useCallback((data: UpdateContractDto): ValidationResult => {
    // Use the service's validation which handles UpdateContractDto
    return contractService.validateContract(data);
  }, [contractService]);

  const validateStatusTransition = useCallback((
    currentStatus: Contract['status'], 
    newStatus: Contract['status']
  ): ValidationResult => {
    // Define valid status transitions
    const validTransitions: Record<Contract['status'], Contract['status'][]> = {
      '啟用中': ['已完成', '暫停中', '已終止'],
      '已完成': [], // Completed contracts cannot change status
      '暫停中': ['啟用中', '已終止'],
      '已終止': [], // Terminated contracts cannot change status
    };

    const allowedStatuses = validTransitions[currentStatus] || [];
    const isValid = allowedStatuses.includes(newStatus);

    return {
      isValid,
      errors: isValid ? [] : [{
        field: 'status',
        message: `Cannot transition from ${currentStatus} to ${newStatus}`,
        code: 'INVALID_STATUS_TRANSITION'
      }]
    };
  }, []);

  return {
    validateContract,
    validateCreateContract,
    validateUpdateContract,
    validateStatusTransition,
  };
}

/**
 * Hook for contract export operations
 */
export function useContractExport(): UseContractExportResult {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<Error | null>(null);
  
  const contractService = useRef(new ContractService()).current;

  const handleExport = useCallback(async (
    contracts: Contract[],
    format: ExportOptions['format'],
    options: Partial<ExportOptions> = {}
  ) => {
    try {
      setExporting(true);
      setExportError(null);
      
      const exportOptions: ExportOptions = {
        format,
        includePayments: false,
        includeChangeOrders: false,
        ...options,
      };
      
      await contractService.exportContracts(contracts, exportOptions);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to export contracts as ${format}`);
      setExportError(error);
      throw error;
    } finally {
      setExporting(false);
    }
  }, [contractService]);

  const exportToCSV = useCallback(async (contracts: Contract[], options?: Partial<ExportOptions>) => {
    return handleExport(contracts, 'csv', options);
  }, [handleExport]);

  const exportToExcel = useCallback(async (contracts: Contract[], options?: Partial<ExportOptions>) => {
    return handleExport(contracts, 'excel', options);
  }, [handleExport]);

  const exportToPDF = useCallback(async (contracts: Contract[], options?: Partial<ExportOptions>) => {
    return handleExport(contracts, 'pdf', options);
  }, [handleExport]);

  const clearExportError = useCallback(() => {
    setExportError(null);
  }, []);

  return {
    exporting,
    exportError,
    exportToCSV,
    exportToExcel,
    exportToPDF,
    clearExportError,
  };
}

/**
 * Hook for batch contract operations
 */
export function useContractBatchActions(): UseContractBatchActionsResult {
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState<Error | null>(null);
  
  const contractService = useRef(new ContractService()).current;

  const handleBatchAction = useCallback(async <T>(
    action: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    try {
      setBatchLoading(true);
      setBatchError(null);
      
      const result = await operation();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(`Failed to ${action}`);
      setBatchError(error);
      throw error;
    } finally {
      setBatchLoading(false);
    }
  }, []);

  const batchUpdateStatus = useCallback(async (contractIds: string[], status: Contract['status']) => {
    return handleBatchAction('batch update status', async () => {
      // Process contracts one by one to ensure proper validation
      const results = await Promise.allSettled(
        contractIds.map(id => contractService.updateContractStatus(id, status))
      );
      
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        throw new Error(`Failed to update ${failures.length} out of ${contractIds.length} contracts`);
      }
    });
  }, [contractService, handleBatchAction]);

  const batchDelete = useCallback(async (contractIds: string[]) => {
    return handleBatchAction('batch delete', async () => {
      // Process contracts one by one to ensure proper validation
      const results = await Promise.allSettled(
        contractIds.map(id => contractService.deleteContract(id))
      );
      
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        throw new Error(`Failed to delete ${failures.length} out of ${contractIds.length} contracts`);
      }
    });
  }, [contractService, handleBatchAction]);

  const batchExport = useCallback(async (contractIds: string[], options: ExportOptions) => {
    return handleBatchAction('batch export', async () => {
      // First, get all contracts by IDs
      const contracts = await Promise.all(
        contractIds.map(async id => {
          const contract = await contractService.getContract(id);
          if (!contract) {
            throw new Error(`Contract with ID ${id} not found`);
          }
          return contract;
        })
      );
      
      // Then export them
      await contractService.exportContracts(contracts, options);
    });
  }, [contractService, handleBatchAction]);

  const clearBatchError = useCallback(() => {
    setBatchError(null);
  }, []);

  return {
    batchLoading,
    batchError,
    batchUpdateStatus,
    batchDelete,
    batchExport,
    clearBatchError,
  };
}

/**
 * Hook for contract form operations
 */
export function useContractForm(initialData?: Partial<Contract>) {
  const [formData, setFormData] = useState<Partial<Contract>>(initialData || {});
  const [validationErrors, setValidationErrors] = useState<ValidationResult['errors']>([]);
  const [isDirty, setIsDirty] = useState(false);
  
  const { validateContract } = useContractValidation();
  const { createContract, updateContract, loading, error } = useContractActions();

  const updateField = useCallback((field: keyof Contract, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Clear validation errors for this field
    setValidationErrors(prev => prev.filter(err => err.field !== field));
  }, []);

  const validateForm = useCallback((): boolean => {
    const validation = validateContract(formData);
    setValidationErrors(validation.errors);
    return validation.isValid;
  }, [formData, validateContract]);

  const submitForm = useCallback(async (): Promise<Contract | null> => {
    if (!validateForm()) {
      return null;
    }

    try {
      let result: Contract;
      
      if (formData.id) {
        // Update existing contract
        const { id, ...updates } = formData;
        result = await updateContract(id, updates as UpdateContractDto);
      } else {
        // Create new contract
        result = await createContract(formData as CreateContractDto);
      }
      
      setIsDirty(false);
      return result;
    } catch (err) {
      // Error is already handled by useContractActions
      return null;
    }
  }, [formData, validateForm, createContract, updateContract]);

  const resetForm = useCallback(() => {
    setFormData(initialData || {});
    setValidationErrors([]);
    setIsDirty(false);
  }, [initialData]);

  const getFieldError = useCallback((field: string) => {
    return validationErrors.find(err => err.field === field);
  }, [validationErrors]);

  return {
    formData,
    validationErrors,
    isDirty,
    loading,
    error,
    updateField,
    validateForm,
    submitForm,
    resetForm,
    getFieldError,
  };
}