/**
 * Contract Actions Business Logic Hooks
 * Handles contract CRUD operations and business actions
 */

import { useState, useCallback, useRef } from 'react';
import { Contract } from '../../types/entities/contract.types';
import { CreateContractDto, UpdateContractDto } from '../../types/dto/contract.dto';
import { ExportOptions, ValidationResult, ValidationError } from '../../types/services/contract.service.types';
import { ContractService } from '../../services/contracts/contract.service';
import { errorService, validationService } from '../../services/shared';
import { EnhancedError, ErrorContext } from '../../types/entities/error.types';

// Hook return types
export interface UseContractActionsResult {
  // State
  loading: boolean;
  error: EnhancedError | null;
  userMessage: string | null;
  
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
  exportError: EnhancedError | null;
  exportUserMessage: string | null;
  exportToCSV: (contracts: Contract[], options?: Partial<ExportOptions>) => Promise<void>;
  exportToExcel: (contracts: Contract[], options?: Partial<ExportOptions>) => Promise<void>;
  exportToPDF: (contracts: Contract[], options?: Partial<ExportOptions>) => Promise<void>;
  clearExportError: () => void;
}

export interface UseContractBatchActionsResult {
  batchLoading: boolean;
  batchError: EnhancedError | null;
  batchUserMessage: string | null;
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
  const [error, setError] = useState<EnhancedError | null>(null);
  const [userMessage, setUserMessage] = useState<string | null>(null);
  
  const contractService = useRef(new ContractService()).current;

  const createErrorContext = useCallback((action: string, metadata?: any): ErrorContext => ({
    component: 'useContractActions',
    action,
    metadata
  }), []);

  const handleAction = useCallback(async <T>(
    action: string,
    operation: () => Promise<T>,
    metadata?: any
  ): Promise<T> => {
    try {
      setLoading(true);
      if (autoReset) {
        setError(null);
        setUserMessage(null);
      }
      
      const result = await operation();
      
      if (onSuccess) {
        onSuccess(action, result);
      }
      
      return result;
    } catch (err) {
      const context = createErrorContext(action, metadata);
      const enhancedError = errorService.handleError(err as Error, context);
      
      setError(enhancedError);
      setUserMessage(errorService.formatErrorMessage(enhancedError));
      
      // Log the error
      errorService.logError(enhancedError);
      
      if (onError) {
        onError(action, enhancedError);
      }
      
      throw enhancedError;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError, autoReset, createErrorContext]);

  const createContract = useCallback(async (data: CreateContractDto): Promise<Contract> => {
    // Validate before creating
    const context = createErrorContext('create contract', { contractData: data });
    const validationResult = validationService.validateContractForCreation(data, context);
    
    if (!validationResult.isValid) {
      const validationError = errorService.createValidationError(
        'contract_data',
        data,
        validationResult.errors.map(e => e.message).join(', '),
        context
      );
      throw validationError;
    }
    
    return handleAction('create contract', () => contractService.createContract(data), { contractData: data });
  }, [contractService, handleAction, createErrorContext]);

  const updateContract = useCallback(async (id: string, updates: UpdateContractDto): Promise<Contract> => {
    // Validate before updating
    const context = createErrorContext('update contract', { contractId: id, updates });
    const validationResult = validationService.validateContractForUpdate(updates, context);
    
    if (!validationResult.isValid) {
      const validationError = errorService.createValidationError(
        'contract_updates',
        updates,
        validationResult.errors.map(e => e.message).join(', '),
        context
      );
      throw validationError;
    }
    
    return handleAction('update contract', () => contractService.updateContract(id, updates), { contractId: id, updates });
  }, [contractService, handleAction, createErrorContext]);

  const deleteContract = useCallback(async (id: string): Promise<void> => {
    return handleAction('delete contract', () => contractService.deleteContract(id), { contractId: id });
  }, [contractService, handleAction]);

  const updateContractStatus = useCallback(async (id: string, status: Contract['status']): Promise<Contract> => {
    return handleAction('update contract status', () => contractService.updateContractStatus(id, status), { contractId: id, newStatus: status });
  }, [contractService, handleAction]);

  const validateContract = useCallback((contract: Partial<Contract>): ValidationResult => {
    const context = createErrorContext('validate contract', { contract });
    
    // Use validation service for enhanced validation
    if ('id' in contract && contract.id) {
      // This is an update validation
      return validationService.validateContractForUpdate(contract as UpdateContractDto, context);
    } else {
      // This is a creation validation
      return validationService.validateContractForCreation(contract as CreateContractDto, context);
    }
  }, [createErrorContext]);

  const exportContracts = useCallback(async (contracts: Contract[], options: ExportOptions): Promise<void> => {
    return handleAction('export contracts', () => contractService.exportContracts(contracts, options), { contractCount: contracts.length, options });
  }, [contractService, handleAction]);

  const clearError = useCallback(() => {
    setError(null);
    setUserMessage(null);
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setUserMessage(null);
  }, []);

  return {
    loading,
    error,
    userMessage,
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
  const [exportError, setExportError] = useState<EnhancedError | null>(null);
  
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
      const enhancedError = errorService.handleError(err as Error);
      setExportError(enhancedError);
      throw enhancedError;
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
    exportUserMessage: exportError ? errorService.formatErrorMessage(exportError) : null,
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
  const [batchError, setBatchError] = useState<EnhancedError | null>(null);
  
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
      const enhancedError = errorService.handleError(err as Error);
      setBatchError(enhancedError);
      throw enhancedError;
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
    batchUserMessage: batchError ? errorService.formatErrorMessage(batchError) : null,
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
    setValidationErrors((prev: ValidationError[]) => prev.filter((err: ValidationError) => err.field !== field));
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
    return validationErrors.find((err: ValidationError) => err.field === field);
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