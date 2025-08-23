/**
 * Common Validation Utilities
 * Provides reusable validation functions for common data types
 */

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate email format
 */
export function validateEmail(email: string, fieldName: string = 'email'): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!email || email.trim().length === 0) {
    errors.push({
      field: fieldName,
      message: '電子郵件為必填項目',
      code: 'REQUIRED_FIELD'
    });
    return errors;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push({
      field: fieldName,
      message: '請輸入有效的電子郵件格式',
      code: 'INVALID_EMAIL_FORMAT'
    });
  }

  if (email.length > 254) {
    errors.push({
      field: fieldName,
      message: '電子郵件長度不能超過254個字元',
      code: 'FIELD_TOO_LONG'
    });
  }

  return errors;
}

/**
 * Validate phone number format (Taiwan)
 */
export function validatePhoneNumber(phone: string, fieldName: string = 'phone'): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!phone || phone.trim().length === 0) {
    return errors; // Phone is optional in most cases
  }

  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Taiwan phone number patterns
  const mobilePattern = /^09\d{8}$/; // Mobile: 09xxxxxxxx
  const landlinePattern = /^0[2-8]\d{7,8}$/; // Landline: 0x-xxxxxxx or 0x-xxxxxxxx
  
  if (!mobilePattern.test(digitsOnly) && !landlinePattern.test(digitsOnly)) {
    errors.push({
      field: fieldName,
      message: '請輸入有效的台灣電話號碼格式',
      code: 'INVALID_PHONE_FORMAT'
    });
  }

  return errors;
}

/**
 * Validate required string field
 */
export function validateRequiredString(
  value: string, 
  fieldName: string, 
  displayName: string,
  minLength?: number,
  maxLength?: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!value || value.trim().length === 0) {
    errors.push({
      field: fieldName,
      message: `${displayName}為必填項目`,
      code: 'REQUIRED_FIELD'
    });
    return errors;
  }

  if (minLength && value.length < minLength) {
    errors.push({
      field: fieldName,
      message: `${displayName}至少需要${minLength}個字元`,
      code: 'FIELD_TOO_SHORT'
    });
  }

  if (maxLength && value.length > maxLength) {
    errors.push({
      field: fieldName,
      message: `${displayName}不能超過${maxLength}個字元`,
      code: 'FIELD_TOO_LONG'
    });
  }

  return errors;
}

/**
 * Validate optional string field
 */
export function validateOptionalString(
  value: string | undefined, 
  fieldName: string, 
  displayName: string,
  maxLength?: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (value && maxLength && value.length > maxLength) {
    errors.push({
      field: fieldName,
      message: `${displayName}不能超過${maxLength}個字元`,
      code: 'FIELD_TOO_LONG'
    });
  }

  return errors;
}

/**
 * Validate numeric value
 */
export function validateNumber(
  value: number,
  fieldName: string,
  displayName: string,
  min?: number,
  max?: number,
  required: boolean = true
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (required && (value === undefined || value === null)) {
    errors.push({
      field: fieldName,
      message: `${displayName}為必填項目`,
      code: 'REQUIRED_FIELD'
    });
    return errors;
  }

  if (value !== undefined && value !== null) {
    if (isNaN(value)) {
      errors.push({
        field: fieldName,
        message: `${displayName}必須是有效的數字`,
        code: 'INVALID_NUMBER'
      });
    } else {
      if (min !== undefined && value < min) {
        errors.push({
          field: fieldName,
          message: `${displayName}不能小於${min}`,
          code: 'VALUE_TOO_SMALL'
        });
      }

      if (max !== undefined && value > max) {
        errors.push({
          field: fieldName,
          message: `${displayName}不能大於${max}`,
          code: 'VALUE_TOO_LARGE'
        });
      }
    }
  }

  return errors;
}

/**
 * Validate date
 */
export function validateDate(
  date: Date,
  fieldName: string,
  displayName: string,
  required: boolean = true,
  minDate?: Date,
  maxDate?: Date
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (required && !date) {
    errors.push({
      field: fieldName,
      message: `${displayName}為必填項目`,
      code: 'REQUIRED_FIELD'
    });
    return errors;
  }

  if (date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      errors.push({
        field: fieldName,
        message: `${displayName}必須是有效的日期`,
        code: 'INVALID_DATE'
      });
    } else {
      if (minDate && date < minDate) {
        errors.push({
          field: fieldName,
          message: `${displayName}不能早於${minDate.toLocaleDateString('zh-TW')}`,
          code: 'DATE_TOO_EARLY'
        });
      }

      if (maxDate && date > maxDate) {
        errors.push({
          field: fieldName,
          message: `${displayName}不能晚於${maxDate.toLocaleDateString('zh-TW')}`,
          code: 'DATE_TOO_LATE'
        });
      }
    }
  }

  return errors;
}

/**
 * Validate date range
 */
export function validateDateRange(
  startDate: Date,
  endDate: Date,
  startFieldName: string = 'startDate',
  endFieldName: string = 'endDate'
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (startDate && endDate) {
    if (startDate >= endDate) {
      errors.push({
        field: endFieldName,
        message: '結束日期必須晚於開始日期',
        code: 'INVALID_DATE_RANGE'
      });
    }
  }

  return errors;
}

/**
 * Validate URL format
 */
export function validateUrl(url: string, fieldName: string = 'url', required: boolean = false): ValidationError[] {
  const errors: ValidationError[] = [];

  if (required && (!url || url.trim().length === 0)) {
    errors.push({
      field: fieldName,
      message: 'URL為必填項目',
      code: 'REQUIRED_FIELD'
    });
    return errors;
  }

  if (url && url.trim().length > 0) {
    try {
      new URL(url);
    } catch {
      errors.push({
        field: fieldName,
        message: '請輸入有效的URL格式',
        code: 'INVALID_URL_FORMAT'
      });
    }
  }

  return errors;
}

/**
 * Validate array field
 */
export function validateArray<T>(
  array: T[],
  fieldName: string,
  displayName: string,
  minLength?: number,
  maxLength?: number,
  required: boolean = false
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (required && (!array || array.length === 0)) {
    errors.push({
      field: fieldName,
      message: `${displayName}為必填項目`,
      code: 'REQUIRED_FIELD'
    });
    return errors;
  }

  if (array) {
    if (minLength !== undefined && array.length < minLength) {
      errors.push({
        field: fieldName,
        message: `${displayName}至少需要${minLength}個項目`,
        code: 'ARRAY_TOO_SHORT'
      });
    }

    if (maxLength !== undefined && array.length > maxLength) {
      errors.push({
        field: fieldName,
        message: `${displayName}不能超過${maxLength}個項目`,
        code: 'ARRAY_TOO_LONG'
      });
    }
  }

  return errors;
}

/**
 * Validate enum value
 */
export function validateEnum<T>(
  value: T,
  allowedValues: T[],
  fieldName: string,
  displayName: string,
  required: boolean = true
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (required && (value === undefined || value === null)) {
    errors.push({
      field: fieldName,
      message: `${displayName}為必填項目`,
      code: 'REQUIRED_FIELD'
    });
    return errors;
  }

  if (value !== undefined && value !== null && !allowedValues.includes(value)) {
    errors.push({
      field: fieldName,
      message: `${displayName}的值無效`,
      code: 'INVALID_ENUM_VALUE'
    });
  }

  return errors;
}

/**
 * Combine multiple validation results
 */
export function combineValidationResults(...results: ValidationResult[]): ValidationResult {
  const allErrors = results.flatMap(result => result.errors);
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}

/**
 * Create validation result from errors
 */
export function createValidationResult(errors: ValidationError[]): ValidationResult {
  return {
    isValid: errors.length === 0,
    errors
  };
}