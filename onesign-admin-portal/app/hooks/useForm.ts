'use client';

import { useState, useCallback, ChangeEvent } from 'react';

export type ValidationRule<T> = {
  required?: boolean | string;
  min?: number | { value: number; message: string };
  max?: number | { value: number; message: string };
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  validate?: (value: any, formValues: T) => string | boolean | Promise<string | boolean>;
};

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T>;
};

export interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: ValidationRules<T>;
  onSubmit?: (values: T) => void | Promise<void>;
}

export interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleBlur: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setFieldTouched: (field: keyof T, touched: boolean) => void;
  validateField: (field: keyof T) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: () => void;
}

/**
 * Hook for form state management with validation
 *
 * @example
 * const form = useForm({
 *   initialValues: { email: '', password: '' },
 *   validationRules: {
 *     email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
 *     password: { required: true, minLength: 8 }
 *   },
 *   onSubmit: async (values) => {
 *     await login(values);
 *   }
 * });
 */
export function useForm<T extends Record<string, any>>({
  initialValues,
  validationRules = {},
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    async (field: keyof T): Promise<boolean> => {
      const value = values[field];
      const rules = validationRules[field];

      if (!rules) return true;

      // Required validation
      if (rules.required) {
        const message = typeof rules.required === 'string' ? rules.required : 'This field is required';
        if (value === undefined || value === null || value === '') {
          setErrors((prev) => ({ ...prev, [field]: message }));
          return false;
        }
      }

      // Min value
      if (rules.min !== undefined && typeof value === 'number') {
        const min = typeof rules.min === 'number' ? rules.min : rules.min.value;
        const message = typeof rules.min === 'object' ? rules.min.message : `Minimum value is ${min}`;
        if (value < min) {
          setErrors((prev) => ({ ...prev, [field]: message }));
          return false;
        }
      }

      // Max value
      if (rules.max !== undefined && typeof value === 'number') {
        const max = typeof rules.max === 'number' ? rules.max : rules.max.value;
        const message = typeof rules.max === 'object' ? rules.max.message : `Maximum value is ${max}`;
        if (value > max) {
          setErrors((prev) => ({ ...prev, [field]: message }));
          return false;
        }
      }

      // Min length
      if (rules.minLength !== undefined && typeof value === 'string') {
        const minLength = typeof rules.minLength === 'number' ? rules.minLength : rules.minLength.value;
        const message = typeof rules.minLength === 'object' ? rules.minLength.message : `Minimum length is ${minLength}`;
        if (value.length < minLength) {
          setErrors((prev) => ({ ...prev, [field]: message }));
          return false;
        }
      }

      // Max length
      if (rules.maxLength !== undefined && typeof value === 'string') {
        const maxLength = typeof rules.maxLength === 'number' ? rules.maxLength : rules.maxLength.value;
        const message = typeof rules.maxLength === 'object' ? rules.maxLength.message : `Maximum length is ${maxLength}`;
        if (value.length > maxLength) {
          setErrors((prev) => ({ ...prev, [field]: message }));
          return false;
        }
      }

      // Pattern validation
      if (rules.pattern && typeof value === 'string') {
        const pattern = rules.pattern instanceof RegExp ? rules.pattern : rules.pattern.value;
        const message = typeof rules.pattern === 'object' ? rules.pattern.message : 'Invalid format';
        if (!pattern.test(value)) {
          setErrors((prev) => ({ ...prev, [field]: message }));
          return false;
        }
      }

      // Custom validation
      if (rules.validate) {
        const result = await rules.validate(value, values);
        if (typeof result === 'string') {
          setErrors((prev) => ({ ...prev, [field]: result }));
          return false;
        }
        if (result === false) {
          setErrors((prev) => ({ ...prev, [field]: 'Invalid value' }));
          return false;
        }
      }

      // Clear error if validation passed
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });

      return true;
    },
    [values, validationRules]
  );

  const validateForm = useCallback(async (): Promise<boolean> => {
    const fields = Object.keys(validationRules) as (keyof T)[];
    const validations = await Promise.all(fields.map(validateField));
    return validations.every((isValid) => isValid);
  }, [validationRules, validateField]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

      setValues((prev) => ({ ...prev, [name]: fieldValue }));

      // Validate on change if field was already touched
      if (touched[name as keyof T]) {
        validateField(name as keyof T);
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      validateField(name as keyof T);
    },
    [validateField]
  );

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const setFieldTouched = useCallback((field: keyof T, isTouched: boolean) => {
    setTouched((prev) => ({ ...prev, [field]: isTouched }));
  }, []);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Mark all fields as touched
      const allTouched = Object.keys(validationRules).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      ) as Partial<Record<keyof T, boolean>>;
      setTouched(allTouched);

      // Validate form
      const isValid = await validateForm();

      if (isValid && onSubmit) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [values, validationRules, validateForm, onSubmit]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    validateField,
    validateForm,
    handleSubmit,
    reset,
  };
}
