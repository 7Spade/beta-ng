/**
 * Validation Service
 * Provides centralized validation logic with error handling integration
 */

import { 
  ValidationError as CommonValidationError, 
  ValidationResult,
  validateRequiredString,
  validateOptionalString,
  validateNumber,
  validateDate,
  validateDateRange,
  validateEmail,
  validatePhoneNumber,
  validateUrl,
  validateArray,
  validateEnum,
  combineValidationResults,
  createValidationResult
} from '../../utils/validation/common.validation';

import {
  validateCreateContract,
  validateUpdateContract,
  validateContractBusinessRules,
  validateStatusTransition
} from '../../utils/validation/contract.validation';

import { errorService } from './error.service';
import { ErrorContext, ValidationError as ErrorTypeValidationError } from '../../types/entities/error.types';
import { Contract, ContractStatus } from '../../types/entities/contract.types';
import { CreateContractDto, UpdateContractDto } from '../../types/dto/contract.dto';

export interface IValidationService {
  // Generic validation methods
  validateRequired<T>(value: T, fieldName: string, displayName: string): ValidationResult;
  validateString(value: string, fieldName: string, displayName: string, options?: StringValidationOptions): ValidationResult;
  validateNumber(value: number, fieldName: string, displayName: string, options?: NumberValidationOptions): ValidationResult;
  validateDate(value: Date, fieldName: string, displayName: string, options?: DateValidationOptions): ValidationResult;
  validateEmail(email: string, fieldName?: string): ValidationResult;
  validatePhone(phone: string, fieldName?: string): ValidationResult;
  validateUrl(url: string, fieldName?: string, required?: boolean): ValidationResult;
  validateArray<T>(array: T[], fieldName: string, displayName: string, options?: ArrayValidationOptions): ValidationResult;
  validateEnum<T>(value: T, allowedValues: T[], fieldName: string, displayName: string, required?: boolean): ValidationResult;
  
  // Contract-specific validation methods
  validateContractForCreation(contractData: CreateContractDto, context?: ErrorContext): ValidationResult;
  validateContractForUpdate(contractData: UpdateContractDto, context?: ErrorContext): ValidationResult;
  validateContractBusinessRules(contract: Partial<Contract>, context?: ErrorContext): ValidationResult;
  validateContractStatusTransition(currentStatus: ContractStatus, newStatus: ContractStatus, context?: ErrorContext): ValidationResult;
  
  // Utility methods
  combineResults(...results: ValidationResult[]): ValidationResult;
  convertToErrorTypes(validationErrors: CommonValidationError[], context?: ErrorContext): ErrorTypeValidationError[];
  createValidationError(field: string, message: string, code: string, value?: any, context?: ErrorContext): ErrorTypeValidationError;
}

export interface StringValidationOptions {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}

export interface NumberValidationOptions {
  required?: boolean;
  min?: number;
  max?: number;
}

export interface DateValidationOptions {
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export interface ArrayValidationOptions {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}

class ValidationService implements IValidationService {
  validateRequired<T>(value: T, fieldName: string, displayName: string): ValidationResult {
    const errors: CommonValidationError[] = [];
    
    if (value === undefined || value === null || (typeof value === 'string' && value.trim().length === 0)) {
      errors.push({
        field: fieldName,
        message: `${displayName}為必填項目`,
        code: 'REQUIRED_FIELD'
      });
    }
    
    return createValidationResult(errors);
  }

  validateString(value: string, fieldName: string, displayName: string, options: StringValidationOptions = {}): ValidationResult {
    const { required = true, minLength, maxLength } = options;
    
    if (required) {
      return createValidationResult(validateRequiredString(value, fieldName, displayName, minLength, maxLength));
    } else {
      return createValidationResult(validateOptionalString(value, fieldName, displayName, maxLength));
    }
  }

  validateNumber(value: number, fieldName: string, displayName: string, options: NumberValidationOptions = {}): ValidationResult {
    const { required = true, min, max } = options;
    
    return createValidationResult(validateNumber(value, fieldName, displayName, min, max, required));
  }

  validateDate(value: Date, fieldName: string, displayName: string, options: DateValidationOptions = {}): ValidationResult {
    const { required = true, minDate, maxDate } = options;
    
    return createValidationResult(validateDate(value, fieldName, displayName, required, minDate, maxDate));
  }

  validateEmail(email: string, fieldName: string = 'email'): ValidationResult {
    return createValidationResult(validateEmail(email, fieldName));
  }

  validatePhone(phone: string, fieldName: string = 'phone'): ValidationResult {
    return createValidationResult(validatePhoneNumber(phone, fieldName));
  }

  validateUrl(url: string, fieldName: string = 'url', required: boolean = false): ValidationResult {
    return createValidationResult(validateUrl(url, fieldName, required));
  }

  validateArray<T>(array: T[], fieldName: string, displayName: string, options: ArrayValidationOptions = {}): ValidationResult {
    const { required = false, minLength, maxLength } = options;
    
    return createValidationResult(validateArray(array, fieldName, displayName, minLength, maxLength, required));
  }

  validateEnum<T>(value: T, allowedValues: T[], fieldName: string, displayName: string, required: boolean = true): ValidationResult {
    return createValidationResult(validateEnum(value, allowedValues, fieldName, displayName, required));
  }

  validateContractForCreation(contractData: CreateContractDto, context?: ErrorContext): ValidationResult {
    const result = validateCreateContract(contractData);
    
    // Log validation errors if any
    if (!result.isValid && context) {
      const enhancedErrors = this.convertToErrorTypes(result.errors, context);
      enhancedErrors.forEach(error => {
        const enhancedError = errorService.handleError(error, context);
        errorService.logError(enhancedError);
      });
    }
    
    return result;
  }

  validateContractForUpdate(contractData: UpdateContractDto, context?: ErrorContext): ValidationResult {
    const result = validateUpdateContract(contractData);
    
    // Log validation errors if any
    if (!result.isValid && context) {
      const enhancedErrors = this.convertToErrorTypes(result.errors, context);
      enhancedErrors.forEach(error => {
        const enhancedError = errorService.handleError(error, context);
        errorService.logError(enhancedError);
      });
    }
    
    return result;
  }

  validateContractBusinessRules(contract: Partial<Contract>, context?: ErrorContext): ValidationResult {
    const result = validateContractBusinessRules(contract);
    
    // Log business rule violations if any
    if (!result.isValid && context) {
      const enhancedErrors = this.convertToErrorTypes(result.errors, context);
      enhancedErrors.forEach(error => {
        const businessError = errorService.createBusinessLogicError(
          error.field,
          error.message,
          context
        );
        errorService.logError(businessError);
      });
    }
    
    return result;
  }

  validateContractStatusTransition(currentStatus: ContractStatus, newStatus: ContractStatus, context?: ErrorContext): ValidationResult {
    const result = validateStatusTransition(currentStatus, newStatus);
    
    // Log invalid status transitions if any
    if (!result.isValid && context) {
      const enhancedErrors = this.convertToErrorTypes(result.errors, context);
      enhancedErrors.forEach(error => {
        const businessError = errorService.createBusinessLogicError(
          'status_transition',
          error.message,
          context
        );
        errorService.logError(businessError);
      });
    }
    
    return result;
  }

  combineResults(...results: ValidationResult[]): ValidationResult {
    return combineValidationResults(...results);
  }

  convertToErrorTypes(validationErrors: CommonValidationError[], context?: ErrorContext): ErrorTypeValidationError[] {
    return validationErrors.map(error => 
      this.createValidationError(error.field, error.message, error.code, undefined, context)
    );
  }

  createValidationError(field: string, message: string, code: string, value?: any, context?: ErrorContext): ErrorTypeValidationError {
    const enhancedError = errorService.createValidationError(field, value, message, context);
    return enhancedError as unknown as ErrorTypeValidationError;
  }

  // Advanced validation methods for complex scenarios
  
  /**
   * Validate multiple fields with cross-field validation
   */
  validateFields(validations: Array<() => ValidationResult>): ValidationResult {
    const results = validations.map(validation => validation());
    return this.combineResults(...results);
  }

  /**
   * Validate with custom business rules
   */
  validateWithBusinessRules<T>(
    data: T,
    rules: Array<(data: T) => ValidationResult>,
    context?: ErrorContext
  ): ValidationResult {
    const results = rules.map(rule => rule(data));
    const combinedResult = this.combineResults(...results);
    
    // Log business rule violations
    if (!combinedResult.isValid && context) {
      const enhancedErrors = this.convertToErrorTypes(combinedResult.errors, context);
      enhancedErrors.forEach(error => {
        const businessError = errorService.createBusinessLogicError(
          error.field,
          error.message,
          context
        );
        errorService.logError(businessError);
      });
    }
    
    return combinedResult;
  }

  /**
   * Validate with async rules (for database checks, etc.)
   */
  async validateAsync<T>(
    data: T,
    asyncRules: Array<(data: T) => Promise<ValidationResult>>,
    context?: ErrorContext
  ): Promise<ValidationResult> {
    try {
      const results = await Promise.all(asyncRules.map(rule => rule(data)));
      const combinedResult = this.combineResults(...results);
      
      // Log validation errors
      if (!combinedResult.isValid && context) {
        const enhancedErrors = this.convertToErrorTypes(combinedResult.errors, context);
        enhancedErrors.forEach(error => {
          const enhancedError = errorService.handleError(error, context);
          errorService.logError(enhancedError);
        });
      }
      
      return combinedResult;
    } catch (error) {
      // Handle async validation errors
      const enhancedError = errorService.handleError(error as Error, context);
      errorService.logError(enhancedError);
      
      return {
        isValid: false,
        errors: [{
          field: 'async_validation',
          message: '異步驗證過程中發生錯誤',
          code: 'ASYNC_VALIDATION_ERROR'
        }]
      };
    }
  }

  /**
   * Validate with conditional rules
   */
  validateConditional<T>(
    data: T,
    condition: (data: T) => boolean,
    rules: Array<(data: T) => ValidationResult>,
    context?: ErrorContext
  ): ValidationResult {
    if (!condition(data)) {
      return { isValid: true, errors: [] };
    }
    
    return this.validateWithBusinessRules(data, rules, context);
  }

  /**
   * Validate array items individually
   */
  validateArrayItems<T>(
    array: T[],
    itemValidator: (item: T, index: number) => ValidationResult,
    fieldName: string = 'items'
  ): ValidationResult {
    const allErrors: CommonValidationError[] = [];
    
    array.forEach((item, index) => {
      const result = itemValidator(item, index);
      if (!result.isValid) {
        // Prefix field names with array index
        const indexedErrors = result.errors.map(error => ({
          ...error,
          field: `${fieldName}[${index}].${error.field}`
        }));
        allErrors.push(...indexedErrors);
      }
    });
    
    return createValidationResult(allErrors);
  }

  /**
   * Validate with custom error messages
   */
  validateWithCustomMessages<T>(
    data: T,
    rules: Array<{
      validator: (data: T) => boolean;
      field: string;
      message: string;
      code: string;
    }>
  ): ValidationResult {
    const errors: CommonValidationError[] = [];
    
    rules.forEach(rule => {
      if (!rule.validator(data)) {
        errors.push({
          field: rule.field,
          message: rule.message,
          code: rule.code
        });
      }
    });
    
    return createValidationResult(errors);
  }
}

// Export singleton instance
export const validationService = new ValidationService();
export { ValidationService };