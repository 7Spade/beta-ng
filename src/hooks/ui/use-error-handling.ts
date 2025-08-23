/**
 * Error Handling UI Hooks
 * Provides UI-specific error handling utilities
 */

import { useState, useCallback, useEffect } from 'react';
import { EnhancedError, ErrorContext } from '../../types/entities/error.types';
import { errorService } from '../../services/shared/error.service';
import { useErrorContext } from '../../context/shared/error.context';

// Hook return types
export interface UseErrorHandlingResult {
  error: EnhancedError | null;
  userMessage: string | null;
  hasError: boolean;
  isRetryable: boolean;
  handleError: (error: Error | EnhancedError, context?: ErrorContext) => void;
  clearError: () => void;
  retry: (() => Promise<void>) | null;
  setRetryFunction: (retryFn: () => Promise<void>) => void;
}

export interface UseFormErrorHandlingResult {
  fieldErrors: Record<string, string>;
  globalError: string | null;
  hasErrors: boolean;
  setFieldError: (field: string, message: string) => void;
  clearFieldError: (field: string) => void;
  clearAllErrors: () => void;
  handleValidationErrors: (errors: Array<{ field: string; message: string }>) => void;
}

export interface UseAsyncErrorHandlingResult {
  loading: boolean;
  error: EnhancedError | null;
  userMessage: string | null;
  execute: <T>(operation: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
}

export interface UseToastErrorHandlingResult {
  showError: (error: Error | EnhancedError, context?: ErrorContext) => void;
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

// Hook options
export interface UseErrorHandlingOptions {
  autoRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  showToast?: boolean;
  persistError?: boolean;
}

/**
 * Main error handling hook for components
 */
export function useErrorHandling(options: UseErrorHandlingOptions = {}): UseErrorHandlingResult {
  const { autoRetry = false, maxRetries = 3, retryDelay = 1000, showToast = true, persistError = false } = options;
  const [error, setError] = useState<EnhancedError | null>(null);
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [retryFunction, setRetryFunction] = useState<(() => Promise<void>) | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const { addError: addGlobalError } = useErrorContext();

  const handleError = useCallback((err: Error | EnhancedError, context?: ErrorContext) => {
    let enhancedError: EnhancedError;
    
    if ('severity' in err && 'category' in err) {
      enhancedError = err as EnhancedError;
    } else {
      enhancedError = errorService.handleError(err, context);
    }
    
    setError(enhancedError);
    setUserMessage(errorService.formatErrorMessage(enhancedError));
    
    // Add to global error context if needed
    if (persistError || enhancedError.severity === 'critical') {
      addGlobalError(enhancedError, context);
    }
    
    // Show toast notification if enabled
    if (showToast) {
      // This would integrate with your toast system
      console.warn('Error:', enhancedError.userMessage || enhancedError.message);
    }
    
    // Auto-retry for retryable errors
    if (autoRetry && enhancedError.retryable && retryCount < maxRetries && retryFunction) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        retryFunction();
      }, retryDelay);
    }
  }, [addGlobalError, persistError, showToast, autoRetry, retryCount, maxRetries, retryFunction, retryDelay]);

  const clearError = useCallback(() => {
    setError(null);
    setUserMessage(null);
    setRetryCount(0);
  }, []);

  const retry = useCallback(async () => {
    if (retryFunction && error?.retryable) {
      clearError();
      try {
        await retryFunction();
      } catch (err) {
        handleError(err as Error);
      }
    }
  }, [retryFunction, error, clearError, handleError]);

  const setRetryFunctionWrapper = useCallback((retryFn: () => Promise<void>) => {
    setRetryFunction(() => retryFn);
  }, []);

  return {
    error,
    userMessage,
    hasError: error !== null,
    isRetryable: error?.retryable || false,
    handleError,
    clearError,
    retry: error?.retryable ? retry : null,
    setRetryFunction: setRetryFunctionWrapper,
  };
}

/**
 * Hook for form-specific error handling
 */
export function useFormErrorHandling(): UseFormErrorHandlingResult {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const setFieldError = useCallback((field: string, message: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
    setGlobalError(null);
  }, []);

  const handleValidationErrors = useCallback((errors: Array<{ field: string; message: string }>) => {
    const newFieldErrors: Record<string, string> = {};
    
    errors.forEach(error => {
      newFieldErrors[error.field] = error.message;
    });
    
    setFieldErrors(newFieldErrors);
  }, []);

  const hasErrors = Object.keys(fieldErrors).length > 0 || globalError !== null;

  return {
    fieldErrors,
    globalError,
    hasErrors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    handleValidationErrors,
  };
}

/**
 * Hook for async operation error handling
 */
export function useAsyncErrorHandling(): UseAsyncErrorHandlingResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<EnhancedError | null>(null);
  const [userMessage, setUserMessage] = useState<string | null>(null);

  const execute = useCallback(async <T>(operation: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      setUserMessage(null);
      
      const result = await operation();
      return result;
    } catch (err) {
      const enhancedError = errorService.handleError(err as Error);
      setError(enhancedError);
      setUserMessage(errorService.formatErrorMessage(enhancedError));
      
      // Log the error
      errorService.logError(enhancedError);
      
      return null;
    } finally {
      setLoading(false);
    }
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
    execute,
    reset,
  };
}

/**
 * Hook for toast-based error notifications
 */
export function useToastErrorHandling(): UseToastErrorHandlingResult {
  // This would integrate with your actual toast system (e.g., react-hot-toast, sonner, etc.)
  
  const showError = useCallback((error: Error | EnhancedError, context?: ErrorContext) => {
    const enhancedError = 'severity' in error && 'category' in error 
      ? error as EnhancedError 
      : errorService.handleError(error, context);
    
    const message = errorService.formatErrorMessage(enhancedError);
    
    // Log the error
    errorService.logError(enhancedError);
    
    // Show toast (replace with your toast implementation)
    console.error('Toast Error:', message);
    
    // Example integration with react-hot-toast:
    // toast.error(message, {
    //   duration: enhancedError.severity === 'critical' ? Infinity : 4000,
    //   id: `error-${enhancedError.code}-${enhancedError.timestamp.getTime()}`,
    // });
  }, []);

  const showSuccess = useCallback((message: string) => {
    console.log('Toast Success:', message);
    // toast.success(message);
  }, []);

  const showWarning = useCallback((message: string) => {
    console.warn('Toast Warning:', message);
    // toast.warning(message);
  }, []);

  const showInfo = useCallback((message: string) => {
    console.info('Toast Info:', message);
    // toast.info(message);
  }, []);

  return {
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };
}

/**
 * Hook for error boundary integration
 */
export function useErrorBoundary() {
  const { addError } = useErrorContext();
  
  const captureError = useCallback((error: Error, errorInfo?: any) => {
    const context: ErrorContext = {
      component: 'ErrorBoundary',
      action: 'componentDidCatch',
      metadata: { errorInfo },
    };
    
    addError(error, context);
  }, [addError]);
  
  return { captureError };
}

/**
 * Hook for network error handling
 */
export function useNetworkErrorHandling() {
  const { handleError } = useErrorHandling({ showToast: true, autoRetry: true, maxRetries: 3 });
  
  const handleNetworkError = useCallback((error: Error, url?: string, statusCode?: number) => {
    const context: ErrorContext = {
      component: 'NetworkRequest',
      action: 'fetch',
      metadata: { url, statusCode },
    };
    
    const networkError = errorService.createNetworkError(
      error.message,
      statusCode,
      url,
      context
    );
    
    handleError(networkError, context);
  }, [handleError]);
  
  return { handleNetworkError };
}

/**
 * Hook for validation error handling
 */
export function useValidationErrorHandling() {
  const { handleError } = useErrorHandling({ showToast: false, persistError: false });
  const { handleValidationErrors } = useFormErrorHandling();
  
  const handleValidationError = useCallback((
    field: string, 
    value: any, 
    message: string, 
    context?: ErrorContext
  ) => {
    const validationError = errorService.createValidationError(field, value, message, context);
    handleError(validationError, context);
    
    // Also set form field error
    handleValidationErrors([{ field, message }]);
  }, [handleError, handleValidationErrors]);
  
  return { handleValidationError };
}