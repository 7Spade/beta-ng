/**
 * Shared entity types and base interfaces
 */

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Common status types
export type EntityStatus = 'active' | 'inactive' | 'pending' | 'archived';

// Common pagination types
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Query parameters
export interface QueryParams {
  filters?: Record<string, any>;
  pagination?: PaginationOptions;
  where?: Array<{
    field: string;
    operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not-in' | 'array-contains' | 'array-contains-any';
    value: any;
  }>;
  orderBy?: Array<{
    field: string;
    direction: 'asc' | 'desc';
  }>;
  limit?: number;
  offset?: number;
}

// Common query result types
export interface QueryResult<T> {
  data: T[];
  count: number;
}

// Common error types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface OperationResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: ValidationError[];
}