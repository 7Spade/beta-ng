/**
 * Hook Error Integration Utilities
 * Provides standardized error handling integration for all hooks
 */

import { useCallback } from 'react';
import { EnhancedError, ErrorContext } from '../../types/entities/error.types';
import { errorService } from '../../services/shared/error.service';
import { useErrorHandling } from './use-error-handling';

// Integration options
export interface HookErrorIntegrationOptions {
  componentName: string;
  showToast?: boolean;
  persistError?: boolean;
  autoRetry?: boolean;
  maxRetries?: number;
  onError?: (error: EnhancedError) => void;
}

// Integration result
export interface HookErrorIntegrationResult {
  error: EnhancedError | null;
  userMessage: string | null;
  hasError: boolean;
  handleError: (error: Error | EnhancedError, action: string, metadata?: any) => void;
  handleAsyncOperation: <T>(
    operation: () => Promise<T>,
    action: string,
    metadata?: any
  ) => Promise<T | null>;
  clearError: () => void;
  createErrorContext: (action: string, metadata?: any) => ErrorContext;
}

/**
 * Hook for standardized error handling integration across all hooks
 */
export function useHookErrorIntegration(
  options: HookErrorIntegrationOptions
): HookErrorIntegrationResult {
  const {
    componentName,
    showToast = false,
    persistError = false,
    autoRetry = false,
    maxRetries = 3,
    onError,
  } = options;

  const { 
    error, 
    userMessage, 
    hasError, 
    handleError: baseHandleError, 
    clearError: baseClearError 
  } = useErrorHandling({
    showToast,
    persistError,
    autoRetry,
    maxRetries,
  });

  const createErrorContext = useCallback((action: string, metadata?: any): ErrorContext => ({
    component: componentName,
    action,
    metadata,
  }), [componentName]);

  const handleError = useCallback((
    err: Error | EnhancedError, 
    action: string, 
    metadata?: any
  ) => {
    const context = createErrorContext(action, metadata);
    
    let enhancedError: EnhancedError;
    if ('severity' in err && 'category' in err) {
      enhancedError = err as EnhancedError;
    } else {
      enhancedError = errorService.handleError(err, context);
    }

    // Log the error
    errorService.logError(enhancedError);

    // Handle through base error handler
    baseHandleError(enhancedError, context);

    // Call custom error handler if provided
    if (onError) {
      onError(enhancedError);
    }
  }, [createErrorContext, baseHandleError, onError]);

  const handleAsyncOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    action: string,
    metadata?: any
  ): Promise<T | null> => {
    try {
      const result = await operation();
      return result;
    } catch (err) {
      handleError(err as Error, action, metadata);
      return null;
    }
  }, [handleError]);

  const clearError = useCallback(() => {
    baseClearError();
  }, [baseClearError]);

  return {
    error,
    userMessage,
    hasError,
    handleError,
    handleAsyncOperation,
    clearError,
    createErrorContext,
  };
}

/**
 * Hook for data fetching operations with error handling
 */
export function useDataFetchingErrorIntegration(componentName: string) {
  return useHookErrorIntegration({
    componentName,
    showToast: true,
    persistError: false,
    autoRetry: true,
    maxRetries: 3,
  });
}

/**
 * Hook for business logic operations with error handling
 */
export function useBusinessLogicErrorIntegration(componentName: string) {
  return useHookErrorIntegration({
    componentName,
    showToast: true,
    persistError: true,
    autoRetry: false,
  });
}

/**
 * Hook for UI operations with error handling
 */
export function useUIErrorIntegration(componentName: string) {
  return useHookErrorIntegration({
    componentName,
    showToast: false,
    persistError: false,
    autoRetry: false,
  });
}

/**
 * Utility function to wrap hook operations with error handling
 */
export function withErrorHandling<T extends any[], R>(
  operation: (...args: T) => R,
  errorIntegration: HookErrorIntegrationResult,
  action: string,
  metadata?: any
): (...args: T) => R | null {
  return (...args: T): R | null => {
    try {
      return operation(...args);
    } catch (err) {
      errorIntegration.handleError(err as Error, action, { args, metadata });
      return null;
    }
  };
}

/**
 * Utility function to wrap async hook operations with error handling
 */
export function withAsyncErrorHandling<T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  errorIntegration: HookErrorIntegrationResult,
  action: string,
  metadata?: any
): (...args: T) => Promise<R | null> {
  return async (...args: T): Promise<R | null> => {
    return errorIntegration.handleAsyncOperation(
      () => operation(...args),
      action,
      { args, metadata }
    );
  };
}

/**
 * Higher-order hook that adds error handling to any hook
 */
export function withHookErrorHandling<T extends Record<string, any>>(
  hookFn: () => T,
  componentName: string,
  options?: Partial<HookErrorIntegrationOptions>
): T & { error: EnhancedError | null; userMessage: string | null; hasError: boolean; clearError: () => void } {
  const errorIntegration = useHookErrorIntegration({
    componentName,
    ...options,
  });

  try {
    const hookResult = hookFn();
    
    return {
      ...hookResult,
      error: errorIntegration.error,
      userMessage: errorIntegration.userMessage,
      hasError: errorIntegration.hasError,
      clearError: errorIntegration.clearError,
    };
  } catch (err) {
    errorIntegration.handleError(err as Error, 'hookExecution');
    
    // Return a safe fallback
    return {
      error: errorIntegration.error,
      userMessage: errorIntegration.userMessage,
      hasError: errorIntegration.hasError,
      clearError: errorIntegration.clearError,
    } as T & { error: EnhancedError | null; userMessage: string | null; hasError: boolean; clearError: () => void };
  }
}