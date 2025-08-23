/**
 * Form State Management Hooks
 * Handles form-related UI state like validation, submission, and field management
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// Types for form state management
export interface FormField<T = any> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

export interface FormState<T extends Record<string, any> = Record<string, any>> {
  fields: { [K in keyof T]: FormField<T[K]> };
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  submitCount: number;
  errors: Record<string, string>;
}

export interface ValidationRule<T = any> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
  message?: string;
}

export type ValidationSchema<T extends Record<string, any> = Record<string, any>> = {
  [K in keyof T]?: ValidationRule<T[K]> | ValidationRule<T[K]>[];
}

// Hook return types
export interface UseFormStateResult<T extends Record<string, any> = Record<string, any>> {
  // Form state
  formState: FormState<T>;
  values: T;
  errors: Record<string, string>;
  touched: Record<keyof T, boolean>;
  
  // Field operations
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  clearError: (field: keyof T) => void;
  setTouched: (field: keyof T, touched?: boolean) => void;
  
  // Form operations
  handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => (e?: React.FormEvent) => Promise<void>;
  reset: (newValues?: Partial<T>) => void;
  validate: () => boolean;
  validateField: (field: keyof T) => boolean;
  
  // Utilities
  getFieldProps: <K extends keyof T>(field: K) => {
    value: T[K];
    onChange: (value: T[K]) => void;
    onBlur: () => void;
    error?: string;
    touched: boolean;
  };
  isFieldValid: (field: keyof T) => boolean;
  isFieldInvalid: (field: keyof T) => boolean;
  canSubmit: boolean;
}

export interface UseFormValidationResult<T extends Record<string, any> = Record<string, any>> {
  validate: (values: T) => Record<string, string>;
  validateField: (field: keyof T, value: T[keyof T]) => string | null;
  isValid: (values: T) => boolean;
}

export interface UseFormSubmissionResult {
  isSubmitting: boolean;
  submitCount: number;
  lastSubmitTime: Date | null;
  submit: (submitFn: () => Promise<void> | void) => Promise<void>;
  reset: () => void;
}

// Hook options
export interface UseFormStateOptions<T extends Record<string, any> = Record<string, any>> {
  initialValues: T;
  validationSchema?: ValidationSchema<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  onSubmit?: (values: T) => Promise<void> | void;
  onValidationError?: (errors: Record<string, string>) => void;
}

/**
 * Main form state management hook
 */
export function useFormState<T extends Record<string, any> = Record<string, any>>(
  options: UseFormStateOptions<T>
): UseFormStateResult<T> {
  const {
    initialValues,
    validationSchema,
    validateOnChange = false,
    validateOnBlur = true,
    validateOnSubmit = true,
    onSubmit,
    onValidationError,
  } = options;

  // Initialize form state
  const [formState, setFormState] = useState<FormState<T>>(() => {
    const fields = {} as { [K in keyof T]: FormField<T[K]> };
    
    Object.keys(initialValues).forEach(key => {
      const fieldKey = key as keyof T;
      fields[fieldKey] = {
        value: initialValues[fieldKey],
        touched: false,
        dirty: false,
      };
    });

    return {
      fields,
      isValid: true,
      isDirty: false,
      isSubmitting: false,
      submitCount: 0,
      errors: {},
    };
  });

  const validationRef = useRef(validationSchema);
  validationRef.current = validationSchema;

  // Validation function
  const validateField = useCallback((field: keyof T, value: T[keyof T]): string | null => {
    const schema = validationRef.current;
    if (!schema || !schema[field as keyof T]) return null;

    const fieldRules = schema[field as keyof T];
    const rules = Array.isArray(fieldRules) ? fieldRules as ValidationRule<T[keyof T]>[] : [fieldRules as ValidationRule<T[keyof T]>];

    for (const rule of rules) {
      if (rule.required && (value === null || value === undefined || value === '')) {
        return rule.message || `${String(field)} is required`;
      }

      if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
        return rule.message || `${String(field)} must be at least ${rule.minLength} characters`;
      }

      if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
        return rule.message || `${String(field)} must be no more than ${rule.maxLength} characters`;
      }

      if (rule.min && typeof value === 'number' && value < rule.min) {
        return rule.message || `${String(field)} must be at least ${rule.min}`;
      }

      if (rule.max && typeof value === 'number' && value > rule.max) {
        return rule.message || `${String(field)} must be no more than ${rule.max}`;
      }

      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        return rule.message || `${String(field)} format is invalid`;
      }

      if (rule.custom) {
        const customError = rule.custom(value);
        if (customError) return customError;
      }
    }

    return null;
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(formState.fields).forEach(key => {
      const fieldKey = key as keyof T;
      const field = formState.fields[fieldKey];
      const error = validateField(fieldKey, field.value);
      
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setFormState(prev => ({
      ...prev,
      errors: newErrors,
      isValid,
    }));

    if (!isValid && onValidationError) {
      onValidationError(newErrors);
    }

    return isValid;
  }, [formState.fields, validateField, onValidationError]);

  // Field operations
  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setFormState(prev => {
      const newFields = { ...prev.fields };
      newFields[field] = {
        ...newFields[field],
        value,
        dirty: true,
      };

      const newErrors = { ...prev.errors };
      
      // Validate on change if enabled
      if (validateOnChange) {
        const error = validateField(field, value);
        if (error) {
          newErrors[field as string] = error;
        } else {
          delete newErrors[field as string];
        }
      }

      const isDirty = Object.values(newFields).some(f => f.dirty);
      const isValid = Object.keys(newErrors).length === 0;

      return {
        ...prev,
        fields: newFields,
        errors: newErrors,
        isDirty,
        isValid,
      };
    });
  }, [validateField, validateOnChange]);

  const setValues = useCallback((values: Partial<T>) => {
    setFormState(prev => {
      const newFields = { ...prev.fields };
      const newErrors = { ...prev.errors };

      Object.keys(values).forEach(key => {
        const fieldKey = key as keyof T;
        if (newFields[fieldKey]) {
          newFields[fieldKey] = {
            ...newFields[fieldKey],
            value: values[fieldKey]!,
            dirty: true,
          };

          // Validate on change if enabled
          if (validateOnChange) {
            const error = validateField(fieldKey, values[fieldKey]!);
            if (error) {
              newErrors[key] = error;
            } else {
              delete newErrors[key];
            }
          }
        }
      });

      const isDirty = Object.values(newFields).some(f => f.dirty);
      const isValid = Object.keys(newErrors).length === 0;

      return {
        ...prev,
        fields: newFields,
        errors: newErrors,
        isDirty,
        isValid,
      };
    });
  }, [validateField, validateOnChange]);

  const setError = useCallback((field: keyof T, error: string) => {
    setFormState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field as string]: error,
      },
      isValid: false,
    }));
  }, []);

  const clearError = useCallback((field: keyof T) => {
    setFormState(prev => {
      const newErrors = { ...prev.errors };
      delete newErrors[field as string];
      
      return {
        ...prev,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0,
      };
    });
  }, []);

  const setTouched = useCallback((field: keyof T, touched: boolean = true) => {
    setFormState(prev => {
      const newFields = { ...prev.fields };
      newFields[field] = {
        ...newFields[field],
        touched,
      };

      const newErrors = { ...prev.errors };

      // Validate on blur if enabled and field is being touched
      if (validateOnBlur && touched) {
        const error = validateField(field, newFields[field].value);
        if (error) {
          newErrors[field as string] = error;
        } else {
          delete newErrors[field as string];
        }
      }

      return {
        ...prev,
        fields: newFields,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0,
      };
    });
  }, [validateField, validateOnBlur]);

  // Form operations
  const handleSubmit = useCallback((onSubmitCallback: (values: T) => Promise<void> | void) => {
    return async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      setFormState(prev => ({
        ...prev,
        isSubmitting: true,
        submitCount: prev.submitCount + 1,
      }));

      try {
        // Validate on submit if enabled
        if (validateOnSubmit) {
          const isValid = validate();
          if (!isValid) {
            return;
          }
        }

        // Extract values from form state
        const values = {} as T;
        Object.keys(formState.fields).forEach(key => {
          const fieldKey = key as keyof T;
          values[fieldKey] = formState.fields[fieldKey].value;
        });

        // Call the submit callback
        await onSubmitCallback(values);

        // Mark all fields as not dirty after successful submission
        setFormState(prev => {
          const newFields = { ...prev.fields };
          Object.keys(newFields).forEach(key => {
            const fieldKey = key as keyof T;
            newFields[fieldKey] = {
              ...newFields[fieldKey],
              dirty: false,
            };
          });

          return {
            ...prev,
            fields: newFields,
            isDirty: false,
          };
        });
      } catch (error) {
        console.error('Form submission error:', error);
        // You might want to set a general form error here
      } finally {
        setFormState(prev => ({
          ...prev,
          isSubmitting: false,
        }));
      }
    };
  }, [formState.fields, validate, validateOnSubmit]);

  const reset = useCallback((newValues?: Partial<T>) => {
    const resetValues = newValues ? { ...initialValues, ...newValues } : initialValues;
    
    const fields = {} as { [K in keyof T]: FormField<T[K]> };
    Object.keys(resetValues).forEach(key => {
      const fieldKey = key as keyof T;
      fields[fieldKey] = {
        value: resetValues[fieldKey],
        touched: false,
        dirty: false,
      };
    });

    setFormState({
      fields,
      isValid: true,
      isDirty: false,
      isSubmitting: false,
      submitCount: 0,
      errors: {},
    });
  }, [initialValues]);

  // Utility functions
  const getFieldProps = useCallback(<K extends keyof T>(field: K) => {
    const fieldState = formState.fields[field];
    
    return {
      value: fieldState.value,
      onChange: (value: T[K]) => setValue(field, value),
      onBlur: () => setTouched(field, true),
      error: formState.errors[field as string],
      touched: fieldState.touched,
    };
  }, [formState.fields, formState.errors, setValue, setTouched]);

  const isFieldValid = useCallback((field: keyof T) => {
    return !formState.errors[field as string];
  }, [formState.errors]);

  const isFieldInvalid = useCallback((field: keyof T) => {
    return !!formState.errors[field as string] && formState.fields[field].touched;
  }, [formState.errors, formState.fields]);

  // Derived values
  const values = Object.keys(formState.fields).reduce((acc, key) => {
    const fieldKey = key as keyof T;
    acc[fieldKey] = formState.fields[fieldKey].value;
    return acc;
  }, {} as T);

  const errors = formState.errors;
  
  const touched = Object.keys(formState.fields).reduce((acc, key) => {
    const fieldKey = key as keyof T;
    (acc as any)[fieldKey] = formState.fields[fieldKey].touched;
    return acc;
  }, {} as Record<keyof T, boolean>);

  const canSubmit = formState.isValid && !formState.isSubmitting;

  return {
    formState,
    values,
    errors,
    touched,
    setValue,
    setValues,
    setError,
    clearError,
    setTouched,
    handleSubmit,
    reset,
    validate,
    validateField: (field: keyof T) => {
      const error = validateField(field, formState.fields[field].value);
      if (error) {
        setError(field, error);
        return false;
      } else {
        clearError(field);
        return true;
      }
    },
    getFieldProps,
    isFieldValid,
    isFieldInvalid,
    canSubmit,
  };
}

/**
 * Hook for form validation only
 */
export function useFormValidation<T extends Record<string, any> = Record<string, any>>(
  validationSchema: ValidationSchema<T>
): UseFormValidationResult<T> {
  const validateField = useCallback((field: keyof T, value: T[keyof T]): string | null => {
    const fieldRules = validationSchema[field as keyof T];
    if (!fieldRules) return null;

    const rules = Array.isArray(fieldRules) 
      ? fieldRules as ValidationRule<T[keyof T]>[] 
      : [fieldRules as ValidationRule<T[keyof T]>];

    for (const rule of rules) {
      if (rule.required && (value === null || value === undefined || value === '')) {
        return rule.message || `${String(field)} is required`;
      }

      if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
        return rule.message || `${String(field)} must be at least ${rule.minLength} characters`;
      }

      if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
        return rule.message || `${String(field)} must be no more than ${rule.maxLength} characters`;
      }

      if (rule.min && typeof value === 'number' && value < rule.min) {
        return rule.message || `${String(field)} must be at least ${rule.min}`;
      }

      if (rule.max && typeof value === 'number' && value > rule.max) {
        return rule.message || `${String(field)} must be no more than ${rule.max}`;
      }

      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        return rule.message || `${String(field)} format is invalid`;
      }

      if (rule.custom) {
        const customError = rule.custom(value);
        if (customError) return customError;
      }
    }

    return null;
  }, [validationSchema]);

  const validate = useCallback((values: T): Record<string, string> => {
    const errors: Record<string, string> = {};

    Object.keys(values).forEach(key => {
      const fieldKey = key as keyof T;
      const error = validateField(fieldKey, values[fieldKey]);
      if (error) {
        errors[key] = error;
      }
    });

    return errors;
  }, [validateField]);

  const isValid = useCallback((values: T): boolean => {
    const errors = validate(values);
    return Object.keys(errors).length === 0;
  }, [validate]);

  return {
    validate,
    validateField,
    isValid,
  };
}

/**
 * Hook for form submission state only
 */
export function useFormSubmission(): UseFormSubmissionResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [lastSubmitTime, setLastSubmitTime] = useState<Date | null>(null);

  const submit = useCallback(async (submitFn: () => Promise<void> | void) => {
    setIsSubmitting(true);
    setSubmitCount(prev => prev + 1);
    setLastSubmitTime(new Date());

    try {
      await submitFn();
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setSubmitCount(0);
    setLastSubmitTime(null);
  }, []);

  return {
    isSubmitting,
    submitCount,
    lastSubmitTime,
    submit,
    reset,
  };
}

/**
 * Hook for managing form arrays (dynamic form fields)
 */
export function useFormArray<T = any>(initialItems: T[] = []) {
  const [items, setItems] = useState<T[]>(initialItems);

  const append = useCallback((item: T) => {
    setItems(prev => [...prev, item]);
  }, []);

  const prepend = useCallback((item: T) => {
    setItems(prev => [item, ...prev]);
  }, []);

  const insert = useCallback((index: number, item: T) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems.splice(index, 0, item);
      return newItems;
    });
  }, []);

  const remove = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const move = useCallback((fromIndex: number, toIndex: number) => {
    setItems(prev => {
      const newItems = [...prev];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      return newItems;
    });
  }, []);

  const update = useCallback((index: number, item: T) => {
    setItems(prev => prev.map((existingItem, i) => i === index ? item : existingItem));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const reset = useCallback((newItems: T[] = initialItems) => {
    setItems(newItems);
  }, [initialItems]);

  return {
    items,
    append,
    prepend,
    insert,
    remove,
    move,
    update,
    clear,
    reset,
    length: items.length,
  };
}