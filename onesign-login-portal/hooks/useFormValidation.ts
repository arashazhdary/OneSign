'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

export interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

export interface FieldValidation {
  value: string;
  error: string;
  touched: boolean;
  isValid: boolean;
  isValidating?: boolean;
}

export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  percentage: number;
}

interface UseFormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
}

export const useFormValidation = (options: UseFormValidationOptions = {}) => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300,
  } = options;

  const [fields, setFields] = useState<Record<string, FieldValidation>>({});
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // Email validation
  const validateEmail = useCallback((email: string): { isValid: boolean; error: string } => {
    if (!email) {
      return { isValid: false, error: '' };
    }

    // RFC 5322 compliant email regex (simplified)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }

    return { isValid: true, error: '' };
  }, []);

  // Password strength calculation
  const calculatePasswordStrength = useCallback((password: string): PasswordStrength => {
    if (!password) {
      return { score: 0, label: '', color: '', percentage: 0 };
    }

    let score = 0;

    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Complexity checks
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++; // Mixed case
    if (/\d/.test(password)) score++; // Contains number
    if (/[^a-zA-Z0-9]/.test(password)) score++; // Contains special char

    // Cap at 4
    score = Math.min(score, 4);

    const strengthMap = {
      0: { label: '', color: '', percentage: 0 },
      1: { label: 'Weak', color: '#ef4444', percentage: 25 },
      2: { label: 'Fair', color: '#f59e0b', percentage: 50 },
      3: { label: 'Good', color: '#3b82f6', percentage: 75 },
      4: { label: 'Strong', color: '#10b981', percentage: 100 },
    };

    return { score, ...strengthMap[score as keyof typeof strengthMap] };
  }, []);

  // Password validation
  const validatePassword = useCallback((password: string): { isValid: boolean; error: string; strength: PasswordStrength } => {
    const strength = calculatePasswordStrength(password);

    if (!password) {
      return { isValid: false, error: '', strength };
    }

    if (password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters', strength };
    }

    return { isValid: true, error: '', strength };
  }, [calculatePasswordStrength]);

  // Custom validation with rules
  const validateField = useCallback((value: string, rules: ValidationRule[]): { isValid: boolean; error: string } => {
    for (const rule of rules) {
      if (!rule.test(value)) {
        return { isValid: false, error: rule.message };
      }
    }
    return { isValid: true, error: '' };
  }, []);

  // Register a field
  const registerField = useCallback((fieldName: string, initialValue: string = '') => {
    setFields((prev) => ({
      ...prev,
      [fieldName]: {
        value: initialValue,
        error: '',
        touched: false,
        isValid: false,
        isValidating: false,
      },
    }));
  }, []);

  // Update field value
  const updateField = useCallback(
    (fieldName: string, value: string, validator?: (value: string) => { isValid: boolean; error: string }) => {
      // Clear existing debounce timer
      if (debounceTimers.current[fieldName]) {
        clearTimeout(debounceTimers.current[fieldName]);
      }

      // Update value immediately
      setFields((prev) => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          value,
          isValidating: validateOnChange && !!validator,
        },
      }));

      // Debounced validation
      if (validateOnChange && validator) {
        debounceTimers.current[fieldName] = setTimeout(() => {
          const validation = validator(value);
          setFields((prev) => ({
            ...prev,
            [fieldName]: {
              ...prev[fieldName],
              isValid: validation.isValid,
              error: prev[fieldName].touched ? validation.error : '',
              isValidating: false,
            },
          }));
        }, debounceMs);
      }
    },
    [validateOnChange, debounceMs]
  );

  // Mark field as touched (on blur)
  const touchField = useCallback(
    (fieldName: string, validator?: (value: string) => { isValid: boolean; error: string }) => {
      setFields((prev) => {
        const field = prev[fieldName];
        if (!field) return prev;

        let validation = { isValid: false, error: '' };
        if (validateOnBlur && validator) {
          validation = validator(field.value);
        }

        return {
          ...prev,
          [fieldName]: {
            ...field,
            touched: true,
            isValid: validation.isValid,
            error: validation.error,
          },
        };
      });
    },
    [validateOnBlur]
  );

  // Check if form is valid
  const isFormValid = useCallback(() => {
    return Object.values(fields).every((field) => field.isValid);
  }, [fields]);

  // Reset all fields
  const resetForm = useCallback(() => {
    setFields({});
    Object.values(debounceTimers.current).forEach(clearTimeout);
    debounceTimers.current = {};
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(clearTimeout);
    };
  }, []);

  return {
    fields,
    registerField,
    updateField,
    touchField,
    validateEmail,
    validatePassword,
    validateField,
    calculatePasswordStrength,
    isFormValid,
    resetForm,
  };
};
