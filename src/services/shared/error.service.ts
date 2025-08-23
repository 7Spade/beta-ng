/**
 * Error Service
 * Provides unified error handling, logging, and user-friendly message formatting
 */

import { 
  AppError, 
  ApplicationError, 
  EnhancedError, 
  ErrorSeverity, 
  ErrorCategory, 
  ErrorContext, 
  ErrorHandlingResult,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  NetworkError,
  DatabaseError,
  BusinessLogicError
} from '../../types/entities/error.types';

export interface IErrorService {
  handleError(error: Error | ApplicationError, context?: ErrorContext): EnhancedError;
  logError(error: EnhancedError): void;
  formatErrorMessage(error: EnhancedError): string;
  createValidationError(field: string, value: any, message: string, context?: ErrorContext): EnhancedError;
  createNotFoundError(resource: string, id: string, context?: ErrorContext): EnhancedError;
  createUnauthorizedError(action?: string, resource?: string, context?: ErrorContext): EnhancedError;
  createForbiddenError(action: string, resource: string, context?: ErrorContext): EnhancedError;
  createConflictError(resource: string, conflictingField: string, context?: ErrorContext): EnhancedError;
  createNetworkError(message: string, statusCode?: number, url?: string, context?: ErrorContext): EnhancedError;
  createDatabaseError(operation: string, message: string, collection?: string, context?: ErrorContext): EnhancedError;
  createBusinessLogicError(rule: string, message: string, context?: ErrorContext): EnhancedError;
  isRetryableError(error: EnhancedError): boolean;
  getErrorSeverity(error: Error | ApplicationError): ErrorSeverity;
  getErrorCategory(error: Error | ApplicationError): ErrorCategory;
}

class ErrorService implements IErrorService {
  private readonly userFriendlyMessages: Record<string, string> = {
    'VALIDATION_ERROR': '輸入的資料格式不正確，請檢查後重試',
    'NOT_FOUND': '找不到指定的資源',
    'UNAUTHORIZED': '您需要登入才能執行此操作',
    'FORBIDDEN': '您沒有權限執行此操作',
    'CONFLICT': '資料衝突，請重新整理後再試',
    'NETWORK_ERROR': '網路連線發生問題，請檢查網路連線',
    'DATABASE_ERROR': '資料庫操作失敗，請稍後再試',
    'BUSINESS_LOGIC_ERROR': '操作不符合業務規則'
  };

  private readonly retryableErrors = new Set([
    'NETWORK_ERROR',
    'DATABASE_ERROR'
  ]);

  handleError(error: Error | ApplicationError, context?: ErrorContext): EnhancedError {
    const timestamp = new Date();
    
    // If it's already an ApplicationError, enhance it
    if (this.isApplicationError(error)) {
      return {
        ...error,
        severity: this.getErrorSeverity(error),
        category: this.getErrorCategory(error),
        context,
        userMessage: this.getUserFriendlyMessage(error.code),
        retryable: this.isRetryableError(error as EnhancedError),
        timestamp: error.timestamp || timestamp,
        name: error.code || 'ApplicationError'
      };
    }

    // Convert generic Error to EnhancedError
    const appError: AppError = {
      code: this.getErrorCodeFromMessage(error.message) || 'SYSTEM_ERROR',
      message: error.message,
      details: error.stack,
      timestamp,
      stack: error.stack
    };

    return {
      ...appError,
      severity: this.getErrorSeverity(error),
      category: this.getErrorCategory(error),
      context,
      userMessage: this.getUserFriendlyMessage(appError.code),
      retryable: false,
      name: error.name || 'Error'
    };
  }

  logError(error: EnhancedError): void {
    const logData = {
      timestamp: error.timestamp,
      code: error.code,
      message: error.message,
      severity: error.severity,
      category: error.category,
      context: error.context,
      details: error.details,
      stack: error.stack
    };

    // Log based on severity
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        console.error('🚨 CRITICAL ERROR:', logData);
        // In production, this would send to monitoring service
        break;
      case ErrorSeverity.HIGH:
        console.error('❌ HIGH SEVERITY ERROR:', logData);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn('⚠️ MEDIUM SEVERITY ERROR:', logData);
        break;
      case ErrorSeverity.LOW:
        console.info('ℹ️ LOW SEVERITY ERROR:', logData);
        break;
      default:
        console.error('ERROR:', logData);
    }

    // In production, send to external logging service
    this.sendToExternalLogging(logData);
  }

  formatErrorMessage(error: EnhancedError): string {
    return error.userMessage || error.message || '發生未知錯誤';
  }

  createValidationError(field: string, value: any, message: string, context?: ErrorContext): EnhancedError {
    return {
      code: 'VALIDATION_ERROR',
      message,
      field,
      value,
      timestamp: new Date(),
      details: { field, value },
      severity: ErrorSeverity.LOW,
      category: ErrorCategory.VALIDATION,
      context,
      userMessage: `${field} 欄位的值不正確: ${message}`,
      retryable: false,
      name: 'ValidationError'
    } as EnhancedError;
  }

  createNotFoundError(resource: string, id: string, context?: ErrorContext): EnhancedError {
    return {
      code: 'NOT_FOUND',
      message: `${resource} with id ${id} not found`,
      resource,
      id,
      timestamp: new Date(),
      details: { resource, id },
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.DATABASE,
      context,
      userMessage: `找不到指定的${resource}`,
      retryable: false,
      name: 'NotFoundError'
    } as EnhancedError;
  }

  createUnauthorizedError(action?: string, resource?: string, context?: ErrorContext): EnhancedError {
    return {
      code: 'UNAUTHORIZED',
      message: `Unauthorized access${action ? ` to ${action}` : ''}${resource ? ` on ${resource}` : ''}`,
      action,
      resource,
      timestamp: new Date(),
      details: { action, resource },
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.AUTHENTICATION,
      context,
      userMessage: '您需要登入才能執行此操作',
      retryable: false,
      name: 'UnauthorizedError'
    } as EnhancedError;
  }

  createForbiddenError(action: string, resource: string, context?: ErrorContext): EnhancedError {
    return {
      code: 'FORBIDDEN',
      message: `Forbidden access to ${action} on ${resource}`,
      action,
      resource,
      timestamp: new Date(),
      details: { action, resource },
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.AUTHORIZATION,
      context,
      userMessage: '您沒有權限執行此操作',
      retryable: false,
      name: 'ForbiddenError'
    } as EnhancedError;
  }

  createConflictError(resource: string, conflictingField: string, context?: ErrorContext): EnhancedError {
    return {
      code: 'CONFLICT',
      message: `Conflict in ${resource} on field ${conflictingField}`,
      resource,
      conflictingField,
      timestamp: new Date(),
      details: { resource, conflictingField },
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.BUSINESS_LOGIC,
      context,
      userMessage: '資料衝突，請重新整理後再試',
      retryable: true,
      name: 'ConflictError'
    } as EnhancedError;
  }

  createNetworkError(message: string, statusCode?: number, url?: string, context?: ErrorContext): EnhancedError {
    return {
      code: 'NETWORK_ERROR',
      message,
      statusCode,
      url,
      timestamp: new Date(),
      details: { statusCode, url },
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.NETWORK,
      context,
      userMessage: '網路連線發生問題，請檢查網路連線',
      retryable: true,
      name: 'NetworkError'
    } as EnhancedError;
  }

  createDatabaseError(operation: string, message: string, collection?: string, context?: ErrorContext): EnhancedError {
    return {
      code: 'DATABASE_ERROR',
      message,
      operation,
      collection,
      timestamp: new Date(),
      details: { operation, collection },
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.DATABASE,
      context,
      userMessage: '資料庫操作失敗，請稍後再試',
      retryable: true,
      name: 'DatabaseError'
    } as EnhancedError;
  }

  createBusinessLogicError(rule: string, message: string, context?: ErrorContext): EnhancedError {
    return {
      code: 'BUSINESS_LOGIC_ERROR',
      message,
      rule,
      timestamp: new Date(),
      details: { rule },
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.BUSINESS_LOGIC,
      context,
      userMessage: message,
      retryable: false,
      name: 'BusinessLogicError'
    } as EnhancedError;
  }

  isRetryableError(error: EnhancedError): boolean {
    return error.retryable || this.retryableErrors.has(error.code);
  }

  getErrorSeverity(error: Error | ApplicationError): ErrorSeverity {
    if (this.isApplicationError(error)) {
      switch (error.code) {
        case 'UNAUTHORIZED':
        case 'FORBIDDEN':
        case 'DATABASE_ERROR':
        case 'NETWORK_ERROR':
          return ErrorSeverity.HIGH;
        case 'NOT_FOUND':
        case 'CONFLICT':
        case 'BUSINESS_LOGIC_ERROR':
          return ErrorSeverity.MEDIUM;
        case 'VALIDATION_ERROR':
          return ErrorSeverity.LOW;
        default:
          return ErrorSeverity.MEDIUM;
      }
    }
    
    // For generic errors, determine severity based on message or type
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return ErrorSeverity.HIGH;
    }
    
    return ErrorSeverity.MEDIUM;
  }

  getErrorCategory(error: Error | ApplicationError): ErrorCategory {
    if (this.isApplicationError(error)) {
      switch (error.code) {
        case 'VALIDATION_ERROR':
          return ErrorCategory.VALIDATION;
        case 'UNAUTHORIZED':
          return ErrorCategory.AUTHENTICATION;
        case 'FORBIDDEN':
          return ErrorCategory.AUTHORIZATION;
        case 'NETWORK_ERROR':
          return ErrorCategory.NETWORK;
        case 'DATABASE_ERROR':
        case 'NOT_FOUND':
          return ErrorCategory.DATABASE;
        case 'BUSINESS_LOGIC_ERROR':
        case 'CONFLICT':
          return ErrorCategory.BUSINESS_LOGIC;
        default:
          return ErrorCategory.SYSTEM;
      }
    }
    
    return ErrorCategory.SYSTEM;
  }

  private isApplicationError(error: any): error is ApplicationError {
    return error && typeof error === 'object' && 'code' in error && 'message' in error;
  }

  private getUserFriendlyMessage(code: string): string {
    return this.userFriendlyMessages[code] || '發生未知錯誤，請稍後再試';
  }

  private getErrorCodeFromMessage(message: string): string | null {
    // Try to extract error codes from common error messages
    if (message.includes('validation') || message.includes('invalid')) {
      return 'VALIDATION_ERROR';
    }
    if (message.includes('not found') || message.includes('404')) {
      return 'NOT_FOUND';
    }
    if (message.includes('unauthorized') || message.includes('401')) {
      return 'UNAUTHORIZED';
    }
    if (message.includes('forbidden') || message.includes('403')) {
      return 'FORBIDDEN';
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'NETWORK_ERROR';
    }
    if (message.includes('database') || message.includes('firestore')) {
      return 'DATABASE_ERROR';
    }
    
    return null;
  }

  private sendToExternalLogging(logData: any): void {
    // In production, this would send to services like:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - Custom logging endpoint
    
    // For now, just store in localStorage for development
    if (typeof window !== 'undefined') {
      try {
        const logs = JSON.parse(localStorage.getItem('app_error_logs') || '[]');
        logs.push(logData);
        // Keep only last 100 logs
        if (logs.length > 100) {
          logs.splice(0, logs.length - 100);
        }
        localStorage.setItem('app_error_logs', JSON.stringify(logs));
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }
}

// Export singleton instance
export const errorService = new ErrorService();
export { ErrorService };