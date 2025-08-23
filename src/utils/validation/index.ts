/**
 * Validation utilities index
 * Exports all validation-related functions and types
 */

// Common validation utilities
export * from './common.validation';

// Contract-specific validation utilities
export * from './contract.validation';

// Re-export common types for convenience
export type { ValidationError, ValidationResult } from './common.validation';