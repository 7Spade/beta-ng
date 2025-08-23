/**
 * Error Context
 * Provides global error state management and user-friendly error handling
 */

'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { EnhancedError, ErrorContext as ErrorContextType } from '../../types/entities/error.types';
import { errorService } from '../../services/shared/error.service';

// Error state interface
export interface ErrorState {
  errors: EnhancedError[];
  globalError: EnhancedError | null;
  isErrorDialogOpen: boolean;
  errorHistory: EnhancedError[];
}

// Error actions
export type ErrorAction =
  | { type: 'ADD_ERROR'; payload: { error: EnhancedError; context?: ErrorContextType } }
  | { type: 'REMOVE_ERROR'; payload: { errorId: string } }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_GLOBAL_ERROR'; payload: { error: EnhancedError | null } }
  | { type: 'TOGGLE_ERROR_DIALOG'; payload: { isOpen: boolean } }
  | { type: 'CLEAR_ERROR_HISTORY' };

// Error context value interface
export interface ErrorContextValue {
  // State
  errors: EnhancedError[];
  globalError: EnhancedError | null;
  isErrorDialogOpen: boolean;
  errorHistory: EnhancedError[];
  
  // Actions
  addError: (error: Error | EnhancedError, context?: ErrorContextType) => void;
  removeError: (errorId: string) => void;
  clearErrors: () => void;
  setGlobalError: (error: EnhancedError | null) => void;
  toggleErrorDialog: (isOpen: boolean) => void;
  clearErrorHistory: () => void;
  
  // Utilities
  hasErrors: boolean;
  getErrorById: (id: string) => EnhancedError | undefined;
  getErrorsByCategory: (category: string) => EnhancedError[];
  getErrorsBySeverity: (severity: string) => EnhancedError[];
  formatErrorForUser: (error: EnhancedError) => string;
}

// Initial state
const initialState: ErrorState = {
  errors: [],
  globalError: null,
  isErrorDialogOpen: false,
  errorHistory: [],
};

// Error reducer
function errorReducer(state: ErrorState, action: ErrorAction): ErrorState {
  switch (action.type) {
    case 'ADD_ERROR': {
      const { error } = action.payload;
      const errorId = `${error.code}-${error.timestamp.getTime()}`;
      const enhancedError = { ...error, id: errorId };
      
      return {
        ...state,
        errors: [...state.errors, enhancedError],
        errorHistory: [...state.errorHistory, enhancedError].slice(-50), // Keep last 50 errors
      };
    }
    
    case 'REMOVE_ERROR': {
      const { errorId } = action.payload;
      return {
        ...state,
        errors: state.errors.filter(error => (error as any).id !== errorId),
      };
    }
    
    case 'CLEAR_ERRORS': {
      return {
        ...state,
        errors: [],
        globalError: null,
      };
    }
    
    case 'SET_GLOBAL_ERROR': {
      const { error } = action.payload;
      return {
        ...state,
        globalError: error,
      };
    }
    
    case 'TOGGLE_ERROR_DIALOG': {
      const { isOpen } = action.payload;
      return {
        ...state,
        isErrorDialogOpen: isOpen,
      };
    }
    
    case 'CLEAR_ERROR_HISTORY': {
      return {
        ...state,
        errorHistory: [],
      };
    }
    
    default:
      return state;
  }
}

// Create context
const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

// Error provider props
export interface ErrorProviderProps {
  children: ReactNode;
  maxErrors?: number;
  autoRemoveTimeout?: number;
}

// Error provider component
export function ErrorProvider({ 
  children, 
  maxErrors = 10, 
  autoRemoveTimeout = 5000 
}: ErrorProviderProps) {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  // Remove error action
  const removeError = useCallback((errorId: string) => {
    dispatch({ type: 'REMOVE_ERROR', payload: { errorId } });
  }, []);

  // Add error action
  const addError = useCallback((error: Error | EnhancedError, context?: ErrorContextType) => {
    let enhancedError: EnhancedError;
    
    if ('severity' in error && 'category' in error) {
      // Already an enhanced error
      enhancedError = error as EnhancedError;
    } else {
      // Convert to enhanced error
      enhancedError = errorService.handleError(error, context);
    }
    
    // Log the error
    errorService.logError(enhancedError);
    
    // Add to state
    dispatch({ type: 'ADD_ERROR', payload: { error: enhancedError, context } });
    
    // Auto-remove after timeout for non-critical errors
    if (enhancedError.severity !== 'critical' && autoRemoveTimeout > 0) {
      setTimeout(() => {
        removeError((enhancedError as any).id);
      }, autoRemoveTimeout);
    }
    
    // Remove oldest errors if we exceed max limit
    if (state.errors.length >= maxErrors) {
      const oldestError = state.errors[0];
      if (oldestError) {
        removeError((oldestError as any).id);
      }
    }
  }, [state.errors.length, maxErrors, autoRemoveTimeout, removeError]);

  // Clear all errors action
  const clearErrors = useCallback(() => {
    dispatch({ type: 'CLEAR_ERRORS' });
  }, []);

  // Set global error action
  const setGlobalError = useCallback((error: EnhancedError | null) => {
    dispatch({ type: 'SET_GLOBAL_ERROR', payload: { error } });
  }, []);

  // Toggle error dialog action
  const toggleErrorDialog = useCallback((isOpen: boolean) => {
    dispatch({ type: 'TOGGLE_ERROR_DIALOG', payload: { isOpen } });
  }, []);

  // Clear error history action
  const clearErrorHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR_HISTORY' });
  }, []);

  // Utility functions
  const hasErrors = state.errors.length > 0;
  
  const getErrorById = useCallback((id: string) => {
    return state.errors.find(error => (error as any).id === id);
  }, [state.errors]);
  
  const getErrorsByCategory = useCallback((category: string) => {
    return state.errors.filter(error => error.category === category);
  }, [state.errors]);
  
  const getErrorsBySeverity = useCallback((severity: string) => {
    return state.errors.filter(error => error.severity === severity);
  }, [state.errors]);
  
  const formatErrorForUser = useCallback((error: EnhancedError) => {
    return errorService.formatErrorMessage(error);
  }, []);

  const contextValue: ErrorContextValue = {
    // State
    errors: state.errors,
    globalError: state.globalError,
    isErrorDialogOpen: state.isErrorDialogOpen,
    errorHistory: state.errorHistory,
    
    // Actions
    addError,
    removeError,
    clearErrors,
    setGlobalError,
    toggleErrorDialog,
    clearErrorHistory,
    
    // Utilities
    hasErrors,
    getErrorById,
    getErrorsByCategory,
    getErrorsBySeverity,
    formatErrorForUser,
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      {children}
    </ErrorContext.Provider>
  );
}

// Hook to use error context
export function useErrorContext(): ErrorContextValue {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useErrorContext must be used within an ErrorProvider');
  }
  return context;
}

// Hook for simplified error handling
export function useErrorHandler() {
  const { addError, clearErrors } = useErrorContext();
  
  const handleError = useCallback((error: Error | EnhancedError, context?: ErrorContextType) => {
    addError(error, context);
  }, [addError]);
  
  const handleAsyncError = useCallback((operation: () => Promise<any>, context?: ErrorContextType): Promise<any> => {
    return operation().catch((error) => {
      handleError(error as Error, context);
      return null;
    });
  }, [handleError]);
  
  return {
    handleError,
    handleAsyncError,
    clearErrors,
  };
}

// Hook for component-specific error handling
export function useComponentErrorHandler(componentName: string) {
  const { handleError, handleAsyncError, clearErrors } = useErrorHandler();
  
  const handleComponentError = useCallback((error: Error | EnhancedError, action?: string, metadata?: any) => {
    const context: ErrorContextType = {
      component: componentName,
      action,
      metadata,
    };
    handleError(error, context);
  }, [handleError, componentName]);
  
  const handleComponentAsyncError = useCallback((operation: () => Promise<any>, action?: string, metadata?: any): Promise<any> => {
    const context: ErrorContextType = {
      component: componentName,
      action,
      metadata,
    };
    return handleAsyncError(operation, context);
  }, [handleAsyncError, componentName]);
  
  return {
    handleError: handleComponentError,
    handleAsyncError: handleComponentAsyncError,
    clearErrors,
  };
}

// Export the context for advanced usage
export { ErrorContext };