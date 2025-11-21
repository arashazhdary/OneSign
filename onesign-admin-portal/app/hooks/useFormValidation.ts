'use client';

import { useMemo } from 'react';

/**
 * Common validation functions
 */
export const validators = {
  required: (message = 'This field is required') => (value: any) => {
    if (value === undefined || value === null || value === '') {
      return message;
    }
    return true;
  },

  email: (message = 'Invalid email address') => (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return message;
    }
    return true;
  },

  minLength: (length: number, message?: string) => (value: string) => {
    if (value && value.length < length) {
      return message || `Minimum length is ${length} characters`;
    }
    return true;
  },

  maxLength: (length: number, message?: string) => (value: string) => {
    if (value && value.length > length) {
      return message || `Maximum length is ${length} characters`;
    }
    return true;
  },

  min: (min: number, message?: string) => (value: number) => {
    if (typeof value === 'number' && value < min) {
      return message || `Minimum value is ${min}`;
    }
    return true;
  },

  max: (max: number, message?: string) => (value: number) => {
    if (typeof value === 'number' && value > max) {
      return message || `Maximum value is ${max}`;
    }
    return true;
  },

  pattern: (pattern: RegExp, message = 'Invalid format') => (value: string) => {
    if (value && !pattern.test(value)) {
      return message;
    }
    return true;
  },

  phone: (message = 'Invalid phone number') => (value: string) => {
    // Simple phone validation (can be customized)
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    if (value && !phoneRegex.test(value)) {
      return message;
    }
    return true;
  },

  url: (message = 'Invalid URL') => (value: string) => {
    try {
      if (value) {
        new URL(value);
      }
      return true;
    } catch {
      return message;
    }
  },

  match: (fieldName: string, message?: string) => (value: any, formValues: any) => {
    if (value !== formValues[fieldName]) {
      return message || `Must match ${fieldName}`;
    }
    return true;
  },

  alphanumeric: (message = 'Only letters and numbers allowed') => (value: string) => {
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (value && !alphanumericRegex.test(value)) {
      return message;
    }
    return true;
  },

  strongPassword: (message = 'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character') => (value: string) => {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (value && !strongPasswordRegex.test(value)) {
      return message;
    }
    return true;
  },
};

/**
 * Hook for composing multiple validation rules
 *
 * @example
 * const emailValidation = useFormValidation([
 *   validators.required(),
 *   validators.email()
 * ]);
 */
export function useFormValidation(
  validationFns: Array<(value: any, formValues?: any) => string | boolean>
) {
  return useMemo(
    () => async (value: any, formValues?: any): Promise<string | boolean> => {
      for (const fn of validationFns) {
        const result = await fn(value, formValues);
        if (result !== true) {
          return result;
        }
      }
      return true;
    },
    [validationFns]
  );
}
