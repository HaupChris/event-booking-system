// src/hooks/useFormManagement.tsx
import { useState, useEffect } from 'react';

/**
 * Interface for form validation errors.
 * Maps each field key to an optional error message string.
 */
export type FormValidation<T> = {
  [K in keyof T]?: string;
};

/**
 * Options for the useFormManagement hook
 */
interface FormManagementOptions<T> {
  /** Initial state of the form */
  initialState: T;
  /**
   * Optional validation rules for form fields
   * Each key maps to a function that returns an error message string (or empty string if valid)
   */
  validationRules?: {
    [K in keyof T]?: (value: any) => string;
  };
  /** LocalStorage key to persist form state */
  storageKey?: string;
  /** LocalStorage key to track form version */
  versionKey?: string;
  /** Current version of the form schema */
  currentVersion?: string;
}

/**
 * useFormManagement
 *
 * A custom hook that provides comprehensive form state management with validation,
 * error handling, and persistent storage.
 *
 * Features:
 * - Type-safe form state management
 * - Field-level validation with custom rules
 * - Persistent storage with version control
 * - Step-based validation for multi-step forms
 * - Error message tracking
 *
 * @param options Configuration options for the form management
 * @returns Object containing form state, validation functions, and utility methods
 *
 * @example
 * // Define validation rules
 * const validationRules = {
 *   email: (value) => (!value ? 'Email is required' :
 *     !/^\S+@\S+\.\S+$/.test(value) ? 'Invalid email format' : ''),
 *   name: (value) => !value ? 'Name is required' : ''
 * };
 *
 * // Use the hook in your component
 * const {
 *   formState,
 *   validation,
 *   updateField,
 *   validateStep
 * } = useFormManagement({
 *   initialState: { email: '', name: '' },
 *   validationRules,
 *   storageKey: 'myForm'
 * });
 *
 * // Handle next step validation
 * const handleNext = () => {
 *   if (validateStep(['email', 'name'])) {
 *     // Proceed to next step
 *   }
 * };
 */
export function useFormManagement<T extends Record<string, any>>({
  initialState,
  validationRules = {},
  storageKey,
  versionKey,
  currentVersion = '1.0'
}: FormManagementOptions<T>) {
  // Form state
  const [formState, setFormState] = useState<T>(initialState);

  // Validation errors for each field
  const [validation, setValidation] = useState<FormValidation<T>>({});

  // Current error message to display (typically the first validation error)
  const [currentError, setCurrentError] = useState<string>('');

  // Load form data from localStorage on mount
  useEffect(() => {
    if (storageKey) {
      // Check version for data migration
      if (versionKey) {
        const storedVersion = localStorage.getItem(versionKey);
        // Clear old data if version mismatch
        if (storedVersion !== currentVersion) {
          localStorage.removeItem(storageKey);
          localStorage.setItem(versionKey, currentVersion);
        }
      }

      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setFormState(parsedData);
        } catch (e) {
          console.error('Error parsing stored form data', e);
        }
      }
    }
  }, [storageKey, versionKey, currentVersion]);

  // Save to localStorage when form state changes
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(formState));
    }
  }, [formState, storageKey]);

  /**
   * Updates a single field in the form state
   * Optionally validates the field if a validation rule exists
   *
   * @param key The field key to update
   * @param value The new value for the field
   */
  const updateField = <K extends keyof T>(key: K, value: T[K]) => {
    setFormState(prev => ({ ...prev, [key]: value }));

    // Validate field if validation rule exists
    if (validationRules[key]) {
      const errorMessage = validationRules[key]!(value);
      setValidation(prev => ({ ...prev, [key]: errorMessage }));
    }
  };

  /**
   * Validates a specific field and updates validation state
   *
   * @param key The field key to validate
   * @param value The value to validate
   * @returns The error message (empty string if valid)
   */
  const validateField = <K extends keyof T>(key: K, value: T[K]): string => {
    if (!validationRules[key]) return '';

    const errorMessage = validationRules[key]!(value);
    setValidation(prev => ({ ...prev, [key]: errorMessage }));
    return errorMessage;
  };

  /**
   * Validates all required fields for a form step
   * Updates currentError with first error found
   *
   * @param requiredFields Array of field keys that are required for the current step
   * @returns true if all required fields are valid, false otherwise
   */
  const validateStep = (requiredFields: Array<keyof T>): boolean => {
    let isValid = true;
    let firstError = '';

    for (const field of requiredFields) {
      const value = formState[field];
      const errorMessage = validateField(field, value);

      if (errorMessage && !firstError) {
        firstError = errorMessage;
        isValid = false;
      }
    }

    setCurrentError(firstError);
    return isValid;
  };

  /**
   * Resets the form to its initial state
   * Clears validation errors and localStorage if applicable
   */
  const resetForm = () => {
    setFormState(initialState);
    setValidation({});
    setCurrentError('');

    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  };

  return {
    formState,
    validation,
    currentError,
    updateField,
    validateField,
    validateStep,
    resetForm,
    setCurrentError
  };
}