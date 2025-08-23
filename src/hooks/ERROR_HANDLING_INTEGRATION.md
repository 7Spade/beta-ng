# Error Handling Integration in Hooks

This document describes the comprehensive error handling integration implemented across all hooks in the application.

## Overview

All hooks now include standardized error handling that provides:
- Consistent error state management
- User-friendly error messages
- Error logging and monitoring
- Error recovery mechanisms
- Context-aware error reporting

## Integration Levels

### 1. Data Hooks (`hooks/data/`)

Data hooks handle errors related to data fetching and caching:

```typescript
const { contracts, loading, error, userMessage, clearError, refetch } = useContracts();

// Error properties:
// - error: EnhancedError | null
// - userMessage: string | null (user-friendly message)
// - clearError: () => void
// - refetch: () => Promise<void> (retry mechanism)
```

**Features:**
- Automatic retry for network errors
- Cache invalidation on errors
- Context-aware error logging
- User-friendly error messages

### 2. Business Logic Hooks (`hooks/business/`)

Business hooks handle errors in business operations:

```typescript
const { createContract, loading, error, userMessage, clearError } = useContractActions();

// Error properties:
// - error: EnhancedError | null
// - userMessage: string | null
// - clearError: () => void
// - reset: () => void (full state reset)
```

**Features:**
- Validation error handling
- Business rule violation reporting
- Operation rollback on errors
- Detailed error context

### 3. UI Hooks (`hooks/ui/`)

UI hooks handle errors in user interface operations:

```typescript
// Form State
const { 
  formState, 
  globalError, 
  userMessage, 
  hasError, 
  clearGlobalError 
} = useFormState(options);

// Table State
const { 
  getProcessedData, 
  error, 
  userMessage, 
  hasError, 
  clearError 
} = useTableState(options);
```

**Features:**
- Form validation error handling
- Table operation error recovery
- UI state consistency on errors
- Non-blocking error handling

## Error Types and Handling

### Enhanced Error Structure

All errors are converted to `EnhancedError` objects:

```typescript
interface EnhancedError {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'validation' | 'authentication' | 'authorization' | 'network' | 'database' | 'business_logic' | 'system';
  context?: ErrorContext;
  userMessage: string;
  retryable: boolean;
  timestamp: Date;
}
```

### Error Context

Every error includes context information:

```typescript
interface ErrorContext {
  component: string;    // Hook or component name
  action: string;       // Operation being performed
  metadata?: any;       // Additional context data
}
```

## Usage Examples

### Data Fetching with Error Handling

```typescript
function ContractsList() {
  const { 
    contracts, 
    loading, 
    error, 
    userMessage, 
    clearError, 
    refetch 
  } = useContracts();

  if (error) {
    return (
      <div className="error-container">
        <p>{userMessage}</p>
        <button onClick={clearError}>Dismiss</button>
        {error.retryable && (
          <button onClick={refetch}>Retry</button>
        )}
      </div>
    );
  }

  return <div>{/* Contract list content */}</div>;
}
```

### Form with Error Handling

```typescript
function ContractForm() {
  const { 
    values, 
    errors, 
    globalError, 
    userMessage, 
    hasError,
    clearGlobalError,
    handleSubmit 
  } = useFormState({
    initialValues: { name: '', client: '' },
    componentName: 'ContractForm',
    onError: (error) => {
      console.error('Form error:', error);
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {hasError && (
        <div className="error-banner">
          <p>{userMessage}</p>
          <button onClick={clearGlobalError}>×</button>
        </div>
      )}
      {/* Form fields */}
    </form>
  );
}
```

### Business Operations with Error Handling

```typescript
function ContractActions() {
  const { 
    createContract, 
    loading, 
    error, 
    userMessage, 
    clearError 
  } = useContractActions({
    onError: (error) => {
      // Custom error handling
      if (error.category === 'validation') {
        showValidationToast(error.userMessage);
      }
    }
  });

  const handleCreate = async (data) => {
    try {
      await createContract(data);
      showSuccessMessage('Contract created successfully');
    } catch (err) {
      // Error is already handled by the hook
      // Additional custom handling can go here
    }
  };

  return (
    <div>
      {error && (
        <ErrorAlert 
          message={userMessage} 
          onDismiss={clearError}
          severity={error.severity}
        />
      )}
      <button onClick={handleCreate} disabled={loading}>
        Create Contract
      </button>
    </div>
  );
}
```

## Error Integration Utilities

### Hook Error Integration

Use the `useHookErrorIntegration` utility for custom hooks:

```typescript
import { useHookErrorIntegration } from '../ui/use-hook-error-integration';

function useCustomHook() {
  const errorIntegration = useHookErrorIntegration({
    componentName: 'useCustomHook',
    showToast: true,
    autoRetry: false,
  });

  const performOperation = useCallback(async () => {
    return errorIntegration.handleAsyncOperation(
      async () => {
        // Your operation here
        return await someAsyncOperation();
      },
      'performOperation',
      { additionalContext: 'value' }
    );
  }, [errorIntegration]);

  return {
    performOperation,
    error: errorIntegration.error,
    userMessage: errorIntegration.userMessage,
    hasError: errorIntegration.hasError,
    clearError: errorIntegration.clearError,
  };
}
```

### Error Handling Wrappers

Use wrapper utilities for consistent error handling:

```typescript
import { withAsyncErrorHandling } from '../ui/use-hook-error-integration';

function useDataHook() {
  const errorIntegration = useDataFetchingErrorIntegration('useDataHook');

  const fetchData = withAsyncErrorHandling(
    async (id: string) => {
      return await dataService.fetchById(id);
    },
    errorIntegration,
    'fetchData'
  );

  return {
    fetchData,
    ...errorIntegration,
  };
}
```

## Error Logging and Monitoring

All errors are automatically:
1. Logged through the error service
2. Sent to monitoring systems (in production)
3. Stored in error context for debugging
4. Formatted for user display

### Error Service Integration

```typescript
// Automatic error logging
errorService.logError(enhancedError);

// User-friendly message formatting
const userMessage = errorService.formatErrorMessage(enhancedError);

// Error categorization and severity assessment
const severity = errorService.getErrorSeverity(error);
const category = errorService.getErrorCategory(error);
```

## Best Practices

### 1. Always Handle Errors

Every hook operation should handle potential errors:

```typescript
// ✅ Good
const { data, error, userMessage, clearError } = useDataHook();

// ❌ Bad
const { data } = useDataHook(); // Ignoring error handling
```

### 2. Provide User Feedback

Always show user-friendly error messages:

```typescript
// ✅ Good
{error && <ErrorMessage message={userMessage} onDismiss={clearError} />}

// ❌ Bad
{error && <div>Error occurred</div>} // Generic message
```

### 3. Enable Error Recovery

Provide ways for users to recover from errors:

```typescript
// ✅ Good
{error && (
  <div>
    <p>{userMessage}</p>
    <button onClick={clearError}>Dismiss</button>
    {error.retryable && <button onClick={retry}>Retry</button>}
  </div>
)}
```

### 4. Use Appropriate Error Context

Provide meaningful context for debugging:

```typescript
// ✅ Good
const context = {
  component: 'ContractForm',
  action: 'submitForm',
  metadata: { contractId, formData }
};

// ❌ Bad
const context = {
  component: 'Unknown',
  action: 'operation'
};
```

## Testing Error Handling

Test error scenarios in your hooks:

```typescript
describe('useContractActions error handling', () => {
  it('should handle validation errors', async () => {
    const { result } = renderHook(() => useContractActions());
    
    // Mock validation error
    mockContractService.createContract.mockRejectedValue(
      new ValidationError('Invalid data')
    );

    await act(async () => {
      await result.current.createContract(invalidData);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.userMessage).toContain('validation');
  });
});
```

## Migration Guide

If you have existing hooks without error handling:

1. Add error handling imports:
```typescript
import { useErrorHandling } from '../ui/use-error-handling';
import { errorService } from '../../services/shared/error.service';
```

2. Add error state to hook result:
```typescript
interface UseMyHookResult {
  // ... existing properties
  error: EnhancedError | null;
  userMessage: string | null;
  hasError: boolean;
  clearError: () => void;
}
```

3. Wrap operations with error handling:
```typescript
const { handleError, clearError, error, userMessage } = useErrorHandling();

const operation = useCallback(async () => {
  try {
    // Your operation
  } catch (err) {
    handleError(err, { component: 'MyHook', action: 'operation' });
  }
}, [handleError]);
```

## Conclusion

The error handling integration provides a robust, consistent, and user-friendly error management system across all hooks. This ensures better user experience, easier debugging, and more maintainable code.