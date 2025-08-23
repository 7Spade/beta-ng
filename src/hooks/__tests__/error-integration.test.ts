/**
 * Error Integration Tests
 * Tests error handling integration across all hooks
 */

import { renderHook, act } from '@testing-library/react';
import { useContracts } from '../data/use-contracts';
import { useContractActions } from '../business/use-contract-actions';
import { useContractDashboardStats } from '../business/use-contract-stats';
import { useFormState } from '../ui/use-form-state';
import { useTableState } from '../ui/use-table-state';
import { useErrorHandling } from '../ui/use-error-handling';
import { errorService } from '../../services/shared/error.service';
import { ErrorSeverity, ErrorCategory } from '../../types/entities/error.types';

// Mock the error service
jest.mock('../../services/shared/error.service');
const mockErrorService = errorService as jest.Mocked<typeof errorService>;

// Mock the repositories and services
jest.mock('../../repositories/contracts/contract.repository');
jest.mock('../../services/contracts/contract.service');
jest.mock('../../services/contracts/contract-stats.service');

describe('Error Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock implementations
    mockErrorService.handleError.mockImplementation((error, context) => ({
      code: 'TEST_ERROR',
      message: error.message,
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.SYSTEM,
      context,
      userMessage: 'Test error occurred',
      retryable: false,
      timestamp: new Date(),
      name: 'TestError',
      details: undefined,
      stack: undefined,
    }));

    mockErrorService.formatErrorMessage.mockReturnValue('User-friendly error message');
    mockErrorService.logError.mockImplementation(() => { });
  });

  describe('Data Hooks Error Integration', () => {
    it('should handle errors in useContracts hook', async () => {
      const { result } = renderHook(() => useContracts());

      // Initially should not have errors
      expect(result.current.error).toBeNull();
      expect(result.current.userMessage).toBeNull();
      expect(result.current.hasError).toBe(false);

      // The hook should have error handling capabilities
      expect(typeof result.current.clearError).toBe('function');
      expect(typeof result.current.refetch).toBe('function');
    });

    it('should provide user-friendly error messages', async () => {
      const { result } = renderHook(() => useContracts());

      // Error handling should be integrated
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('userMessage');
      expect(result.current).toHaveProperty('clearError');
    });
  });

  describe('Business Logic Hooks Error Integration', () => {
    it('should handle errors in useContractActions hook', () => {
      const { result } = renderHook(() => useContractActions());

      // Should have error handling properties
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('userMessage');
      expect(result.current).toHaveProperty('clearError');
      expect(result.current).toHaveProperty('reset');

      // Initially should not have errors
      expect(result.current.error).toBeNull();
      expect(result.current.userMessage).toBeNull();
    });

    it('should handle errors in useContractDashboardStats hook', () => {
      const { result } = renderHook(() => useContractDashboardStats());

      // Should have error handling properties
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('userMessage');
      expect(result.current).toHaveProperty('clearError');

      // Initially should not have errors
      expect(result.current.error).toBeNull();
      expect(result.current.userMessage).toBeNull();
    });
  });

  describe('UI Hooks Error Integration', () => {
    it('should handle errors in useFormState hook', () => {
      const { result } = renderHook(() =>
        useFormState({
          initialValues: { name: '', email: '' },
          componentName: 'TestForm',
        })
      );

      // Should have error handling properties
      expect(result.current).toHaveProperty('globalError');
      expect(result.current).toHaveProperty('userMessage');
      expect(result.current).toHaveProperty('hasError');
      expect(result.current).toHaveProperty('clearGlobalError');

      // Initially should not have errors
      expect(result.current.globalError).toBeNull();
      expect(result.current.userMessage).toBeNull();
      expect(result.current.hasError).toBe(false);
    });

    it('should handle errors in useTableState hook', () => {
      const { result } = renderHook(() =>
        useTableState({
          componentName: 'TestTable',
        })
      );

      // Should have error handling properties
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('userMessage');
      expect(result.current).toHaveProperty('hasError');
      expect(result.current).toHaveProperty('clearError');

      // Initially should not have errors
      expect(result.current.error).toBeNull();
      expect(result.current.userMessage).toBeNull();
      expect(result.current.hasError).toBe(false);
    });

    it('should handle sorting errors in useTableState', () => {
      const { result } = renderHook(() =>
        useTableState({
          componentName: 'TestTable',
        })
      );

      // Test data processing with potential errors
      const testData = [
        { id: 1, name: 'Test 1' },
        { id: 2, name: 'Test 2' },
      ];

      act(() => {
        const processedData = result.current.getProcessedData(testData);
        // Should return data even if there are internal errors
        expect(Array.isArray(processedData)).toBe(true);
      });
    });
  });

  describe('Error Context Integration', () => {
    it('should provide error context information', () => {
      const { result } = renderHook(() => useErrorHandling());

      // Should have comprehensive error handling
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('userMessage');
      expect(result.current).toHaveProperty('hasError');
      expect(result.current).toHaveProperty('isRetryable');
      expect(result.current).toHaveProperty('handleError');
      expect(result.current).toHaveProperty('clearError');
    });

    it('should handle error context properly', () => {
      const { result } = renderHook(() => useErrorHandling());

      const testError = new Error('Test error');
      const testContext = {
        component: 'TestComponent',
        action: 'testAction',
        metadata: { test: true },
      };

      act(() => {
        result.current.handleError(testError, testContext);
      });

      // Should have called error service with context
      expect(mockErrorService.handleError).toHaveBeenCalledWith(testError, testContext);
    });
  });

  describe('Error Recovery', () => {
    it('should allow error clearing across all hooks', () => {
      const formHook = renderHook(() =>
        useFormState({
          initialValues: { name: '' },
          componentName: 'TestForm',
        })
      );

      const tableHook = renderHook(() =>
        useTableState({
          componentName: 'TestTable',
        })
      );

      // Both hooks should have clearError functionality
      expect(typeof formHook.result.current.clearGlobalError).toBe('function');
      expect(typeof tableHook.result.current.clearError).toBe('function');

      // Should be able to clear errors
      act(() => {
        formHook.result.current.clearGlobalError();
        tableHook.result.current.clearError();
      });

      // No errors should be thrown
      expect(formHook.result.current.hasError).toBe(false);
      expect(tableHook.result.current.hasError).toBe(false);
    });
  });

  describe('Error Logging Integration', () => {
    it('should log errors through error service', () => {
      const { result } = renderHook(() => useErrorHandling());

      const testError = new Error('Test logging error');

      act(() => {
        result.current.handleError(testError);
      });

      // Should have logged the error
      expect(mockErrorService.logError).toHaveBeenCalled();
    });
  });

  describe('User Message Formatting', () => {
    it('should provide user-friendly messages across all hooks', () => {
      const hooks = [
        renderHook(() => useContracts()),
        renderHook(() => useContractActions()),
        renderHook(() => useContractDashboardStats()),
        renderHook(() => useFormState({
          initialValues: { name: '' },
          componentName: 'TestForm'
        })),
        renderHook(() => useTableState({ componentName: 'TestTable' })),
      ];

      hooks.forEach(hook => {
        // All hooks should have userMessage property
        expect(hook.result.current).toHaveProperty('userMessage');

        // Initially should be null
        expect(hook.result.current.userMessage).toBeNull();
      });
    });
  });

  describe('Error Consistency', () => {
    it('should have consistent error handling interface across hooks', () => {
      const dataHook = renderHook(() => useContracts());
      const businessHook = renderHook(() => useContractActions());
      const uiFormHook = renderHook(() => useFormState({
        initialValues: { name: '' },
        componentName: 'TestForm'
      }));
      const uiTableHook = renderHook(() => useTableState({
        componentName: 'TestTable'
      }));

      // All hooks should have error property (or equivalent)
      expect(dataHook.result.current).toHaveProperty('error');
      expect(businessHook.result.current).toHaveProperty('error');
      expect(uiFormHook.result.current).toHaveProperty('globalError');
      expect(uiTableHook.result.current).toHaveProperty('error');

      // All hooks should have userMessage
      expect(dataHook.result.current).toHaveProperty('userMessage');
      expect(businessHook.result.current).toHaveProperty('userMessage');
      expect(uiFormHook.result.current).toHaveProperty('userMessage');
      expect(uiTableHook.result.current).toHaveProperty('userMessage');

      // All hooks should have clear error functionality
      expect(typeof dataHook.result.current.clearError).toBe('function');
      expect(typeof businessHook.result.current.clearError).toBe('function');
      expect(typeof uiFormHook.result.current.clearGlobalError).toBe('function');
      expect(typeof uiTableHook.result.current.clearError).toBe('function');
    });
  });
});