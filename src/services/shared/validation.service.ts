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
  validateStatusTransition,
  validateContractDataConsistency,
  validateContractForScenario
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

  // Specialized validation methods
  validateFile(file: File | null, fieldName?: string, options?: FileValidationOptions): ValidationResult;
  validateCurrency(amount: number, fieldName: string, displayName: string, options?: CurrencyValidationOptions): ValidationResult;
  validatePercentage(value: number, fieldName: string, displayName: string, options?: PercentageValidationOptions): ValidationResult;
  validateTaiwanId(id: string, fieldName?: string, required?: boolean): ValidationResult;
  validateBusinessNumber(number: string, fieldName?: string, required?: boolean): ValidationResult;

  // Contract-specific validation methods
  validateContractForCreation(contractData: CreateContractDto, context?: ErrorContext): ValidationResult;
  validateContractForUpdate(contractData: UpdateContractDto, context?: ErrorContext): ValidationResult;
  validateContractBusinessRules(contract: Partial<Contract>, context?: ErrorContext): ValidationResult;
  validateContractStatusTransition(currentStatus: ContractStatus, newStatus: ContractStatus, context?: ErrorContext): ValidationResult;
  validateContractDataConsistency(contract: Partial<Contract>, context?: ErrorContext): ValidationResult;
  validateContractForScenario(contract: Partial<Contract>, scenario: 'creation' | 'completion' | 'termination' | 'renewal', context?: ErrorContext): ValidationResult;

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

export interface FileValidationOptions {
  required?: boolean;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

export interface CurrencyValidationOptions {
  required?: boolean;
  min?: number;
  max?: number;
  currency?: string;
  allowNegative?: boolean;
}

export interface PercentageValidationOptions {
  required?: boolean;
  min?: number;
  max?: number;
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

  validateContractDataConsistency(contract: Partial<Contract>, context?: ErrorContext): ValidationResult {
    const result = validateContractDataConsistency(contract);

    // Log data consistency errors if any
    if (!result.isValid && context) {
      const enhancedErrors = this.convertToErrorTypes(result.errors, context);
      enhancedErrors.forEach(error => {
        const dataError = errorService.createValidationError(
          error.field,
          error.value,
          error.message,
          context
        );
        errorService.logError(dataError);
      });
    }

    return result;
  }

  validateContractForScenario(
    contract: Partial<Contract>,
    scenario: 'creation' | 'completion' | 'termination' | 'renewal',
    context?: ErrorContext
  ): ValidationResult {
    const result = validateContractForScenario(contract, scenario);

    // Log scenario-specific validation errors if any
    if (!result.isValid && context) {
      const enhancedErrors = this.convertToErrorTypes(result.errors, context);
      enhancedErrors.forEach(error => {
        const scenarioError = errorService.createBusinessLogicError(
          `${scenario}_validation`,
          error.message,
          context
        );
        errorService.logError(scenarioError);
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

  /**
   * Validate file upload data
   */
  validateFile(
    file: File | null,
    fieldName: string = 'file',
    options: {
      required?: boolean;
      maxSize?: number; // in bytes
      allowedTypes?: string[];
      allowedExtensions?: string[];
    } = {}
  ): ValidationResult {
    const errors: CommonValidationError[] = [];
    const { required = false, maxSize, allowedTypes, allowedExtensions } = options;

    if (required && !file) {
      errors.push({
        field: fieldName,
        message: '檔案為必填項目',
        code: 'REQUIRED_FIELD'
      });
      return createValidationResult(errors);
    }

    if (file) {
      // Check file size
      if (maxSize && file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        errors.push({
          field: fieldName,
          message: `檔案大小不能超過 ${maxSizeMB}MB`,
          code: 'FILE_TOO_LARGE'
        });
      }

      // Check file type
      if (allowedTypes && !allowedTypes.includes(file.type)) {
        errors.push({
          field: fieldName,
          message: `不支援的檔案類型: ${file.type}`,
          code: 'INVALID_FILE_TYPE'
        });
      }

      // Check file extension
      if (allowedExtensions) {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
          errors.push({
            field: fieldName,
            message: `不支援的檔案副檔名，僅支援: ${allowedExtensions.join(', ')}`,
            code: 'INVALID_FILE_EXTENSION'
          });
        }
      }
    }

    return createValidationResult(errors);
  }

  /**
   * Validate currency amount
   */
  validateCurrency(
    amount: number,
    fieldName: string,
    displayName: string,
    options: {
      required?: boolean;
      min?: number;
      max?: number;
      currency?: string;
      allowNegative?: boolean;
    } = {}
  ): ValidationResult {
    const { required = true, min = 0, max, allowNegative = false } = options;
    const errors: CommonValidationError[] = [];

    if (required && (amount === undefined || amount === null)) {
      errors.push({
        field: fieldName,
        message: `${displayName}為必填項目`,
        code: 'REQUIRED_FIELD'
      });
      return createValidationResult(errors);
    }

    if (amount !== undefined && amount !== null) {
      if (isNaN(amount)) {
        errors.push({
          field: fieldName,
          message: `${displayName}必須是有效的金額`,
          code: 'INVALID_CURRENCY'
        });
      } else {
        if (!allowNegative && amount < 0) {
          errors.push({
            field: fieldName,
            message: `${displayName}不能為負數`,
            code: 'NEGATIVE_VALUE_NOT_ALLOWED'
          });
        }

        if (min !== undefined && amount < min) {
          errors.push({
            field: fieldName,
            message: `${displayName}不能小於 ${min}`,
            code: 'VALUE_TOO_SMALL'
          });
        }

        if (max !== undefined && amount > max) {
          errors.push({
            field: fieldName,
            message: `${displayName}不能大於 ${max}`,
            code: 'VALUE_TOO_LARGE'
          });
        }

        // Check for reasonable decimal places (max 2 for currency)
        const decimalPlaces = (amount.toString().split('.')[1] || '').length;
        if (decimalPlaces > 2) {
          errors.push({
            field: fieldName,
            message: `${displayName}最多只能有2位小數`,
            code: 'TOO_MANY_DECIMAL_PLACES'
          });
        }
      }
    }

    return createValidationResult(errors);
  }

  /**
   * Validate percentage value
   */
  validatePercentage(
    value: number,
    fieldName: string,
    displayName: string,
    options: {
      required?: boolean;
      min?: number;
      max?: number;
    } = {}
  ): ValidationResult {
    const { required = true, min = 0, max = 100 } = options;
    const errors: CommonValidationError[] = [];

    if (required && (value === undefined || value === null)) {
      errors.push({
        field: fieldName,
        message: `${displayName}為必填項目`,
        code: 'REQUIRED_FIELD'
      });
      return createValidationResult(errors);
    }

    if (value !== undefined && value !== null) {
      if (isNaN(value)) {
        errors.push({
          field: fieldName,
          message: `${displayName}必須是有效的百分比`,
          code: 'INVALID_PERCENTAGE'
        });
      } else {
        if (value < min) {
          errors.push({
            field: fieldName,
            message: `${displayName}不能小於 ${min}%`,
            code: 'PERCENTAGE_TOO_SMALL'
          });
        }

        if (value > max) {
          errors.push({
            field: fieldName,
            message: `${displayName}不能大於 ${max}%`,
            code: 'PERCENTAGE_TOO_LARGE'
          });
        }
      }
    }

    return createValidationResult(errors);
  }

  /**
   * Validate Taiwan ID number (身分證字號)
   */
  validateTaiwanId(
    id: string,
    fieldName: string = 'taiwanId',
    required: boolean = false
  ): ValidationResult {
    const errors: CommonValidationError[] = [];

    if (required && (!id || id.trim().length === 0)) {
      errors.push({
        field: fieldName,
        message: '身分證字號為必填項目',
        code: 'REQUIRED_FIELD'
      });
      return createValidationResult(errors);
    }

    if (id && id.trim().length > 0) {
      // Taiwan ID format: 1 letter + 9 digits
      const taiwanIdPattern = /^[A-Z][12]\d{8}$/;

      if (!taiwanIdPattern.test(id.toUpperCase())) {
        errors.push({
          field: fieldName,
          message: '請輸入有效的台灣身分證字號格式',
          code: 'INVALID_TAIWAN_ID_FORMAT'
        });
      } else {
        // Validate checksum
        const letterValues: Record<string, number> = {
          'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15, 'G': 16, 'H': 17,
          'I': 34, 'J': 18, 'K': 19, 'L': 20, 'M': 21, 'N': 22, 'O': 35, 'P': 23,
          'Q': 24, 'R': 25, 'S': 26, 'T': 27, 'U': 28, 'V': 29, 'W': 32, 'X': 30,
          'Y': 31, 'Z': 33
        };

        const firstLetter = id.charAt(0).toUpperCase();
        const letterValue = letterValues[firstLetter];
        const digits = id.substring(1).split('').map(Number);

        const checksum = Math.floor(letterValue / 10) +
          (letterValue % 10) * 9 +
          digits[0] * 8 +
          digits[1] * 7 +
          digits[2] * 6 +
          digits[3] * 5 +
          digits[4] * 4 +
          digits[5] * 3 +
          digits[6] * 2 +
          digits[7] * 1 +
          digits[8];

        if (checksum % 10 !== 0) {
          errors.push({
            field: fieldName,
            message: '身分證字號檢查碼錯誤',
            code: 'INVALID_TAIWAN_ID_CHECKSUM'
          });
        }
      }
    }

    return createValidationResult(errors);
  }

  /**
   * Validate business registration number (統一編號)
   */
  validateBusinessNumber(
    number: string,
    fieldName: string = 'businessNumber',
    required: boolean = false
  ): ValidationResult {
    const errors: CommonValidationError[] = [];

    if (required && (!number || number.trim().length === 0)) {
      errors.push({
        field: fieldName,
        message: '統一編號為必填項目',
        code: 'REQUIRED_FIELD'
      });
      return createValidationResult(errors);
    }

    if (number && number.trim().length > 0) {
      // Taiwan business number format: 8 digits
      const businessNumberPattern = /^\d{8}$/;

      if (!businessNumberPattern.test(number)) {
        errors.push({
          field: fieldName,
          message: '統一編號必須為8位數字',
          code: 'INVALID_BUSINESS_NUMBER_FORMAT'
        });
      } else {
        // Validate checksum
        const digits = number.split('').map(Number);
        const weights = [1, 2, 1, 2, 1, 2, 4, 1];

        let sum = 0;
        for (let i = 0; i < 8; i++) {
          let product = digits[i] * weights[i];
          sum += Math.floor(product / 10) + (product % 10);
        }

        if (sum % 10 !== 0) {
          // Special case for 7th digit
          if (digits[6] === 7) {
            sum += 1;
            if (sum % 10 !== 0) {
              errors.push({
                field: fieldName,
                message: '統一編號檢查碼錯誤',
                code: 'INVALID_BUSINESS_NUMBER_CHECKSUM'
              });
            }
          } else {
            errors.push({
              field: fieldName,
              message: '統一編號檢查碼錯誤',
              code: 'INVALID_BUSINESS_NUMBER_CHECKSUM'
            });
          }
        }
      }
    }

    return createValidationResult(errors);
  }
}

// Export singleton instance
export const validationService = new ValidationService();
export { ValidationService };