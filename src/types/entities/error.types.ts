/**
 * Error types and interfaces for unified error handling
 */

// Base error interface
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  stack?: string;
}

// Specific error types
export interface ValidationError extends AppError {
  code: 'VALIDATION_ERROR';
  field: string;
  value: any;
}

export interface NotFoundError extends AppError {
  code: 'NOT_FOUND';
  resource: string;
  id: string;
}

export interface UnauthorizedError extends AppError {
  code: 'UNAUTHORIZED';
  action?: string;
  resource?: string;
}

export interface ForbiddenError extends AppError {
  code: 'FORBIDDEN';
  action: string;
  resource: string;
}

export interface ConflictError extends AppError {
  code: 'CONFLICT';
  resource: string;
  conflictingField: string;
}

export interface NetworkError extends AppError {
  code: 'NETWORK_ERROR';
  statusCode?: number;
  url?: string;
}

export interface DatabaseError extends AppError {
  code: 'DATABASE_ERROR';
  operation: string;
  collection?: string;
}

export interface BusinessLogicError extends AppError {
  code: 'BUSINESS_LOGIC_ERROR';
  rule: string;
}

// Union type for all error types
export type ApplicationError = 
  | ValidationError
  | NotFoundError
  | UnauthorizedError
  | ForbiddenError
  | ConflictError
  | NetworkError
  | DatabaseError
  | BusinessLogicError;

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories for logging and monitoring
export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NETWORK = 'network',
  DATABASE = 'database',
  BUSINESS_LOGIC = 'business_logic',
  SYSTEM = 'system',
  USER_INPUT = 'user_input'
}

// Error context for better debugging
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

// Enhanced error with context and severity
export interface EnhancedError extends AppError {
  severity: ErrorSeverity;
  category: ErrorCategory;
  context?: ErrorContext;
  userMessage?: string;
  retryable?: boolean;
  name: string; // Required by Error interface
}

// Error handling result
export interface ErrorHandlingResult {
  handled: boolean;
  userMessage: string;
  shouldRetry: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
}