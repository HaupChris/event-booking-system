// src/hooks/useFormManagement.tsx
import {useState, useEffect} from 'react';

/**
 * Interface for form validation errors.
 * Maps each field key to an optional error message string.
 */
export type FormValidation<T> = {
    [K in keyof T]?: string;
};

// Add step management to the options interface
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
  /** Initial step value */
  initialStep?: number;
}

/**
 * Return type expanded to include step management
 */
interface FormManagementReturn<T> {
  formState: T;
  validation: FormValidation<T>;
  currentError: string;
  updateField: <K extends keyof T>(key: K, value: T[K]) => void;
  validateField: <K extends keyof T>(key: K, value: T[K]) => string;
  setCurrentError: (message: string) => void;
  activeStep: number;
  handleNext: (requiredFields: Array<keyof T>) => void;
  handlePrevious: () => void;
}

export function useFormManagement<T extends Record<string, any>>({
  initialState,
  validationRules = {},
  storageKey,
  versionKey,
  currentVersion = '1.0',
  initialStep = 0
}: FormManagementOptions<T>): FormManagementReturn<T> {
  // Add a flag to prevent overriding loaded data
  const [isInitialized, setIsInitialized] = useState(false);
  const [formState, setFormState] = useState<T>(initialState);

  // Add step state
  const [activeStep, setActiveStep] = useState<number>(initialStep);

  // Validation errors for each field
  const [validation, setValidation] = useState<FormValidation<T>>({});

  // Current error message to display (typically the first validation error)
  const [currentError, setCurrentError] = useState<string>('');

  // Load form data and active step from localStorage on mount
  useEffect(() => {
    if (storageKey) {
      // Check version for data migration
      if (versionKey) {
        const storedVersion = localStorage.getItem(versionKey);
        // Clear old data if version mismatch
        if (storedVersion !== currentVersion) {
          localStorage.removeItem(storageKey);
          localStorage.removeItem(`${storageKey}_step`);
          localStorage.setItem(versionKey, currentVersion);
        }
      }

      // Load form data
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setFormState(parsedData);

          // Load step
          const storedStep = localStorage.getItem(`${storageKey}_step`);
          if (storedStep) {
            setActiveStep(parseInt(storedStep, 10));
          }

          setIsInitialized(true); // Mark as initialized with stored data
        } catch (e) {
        }
      } else {
        setIsInitialized(true); // Mark as initialized with initial state
      }
    } else {
      setIsInitialized(true); // No storage key, just use initial state
    }
  }, [storageKey, versionKey, currentVersion, initialStep]);

  // Save to localStorage when form state changes
  useEffect(() => {
    if (storageKey && isInitialized) { // Only save after initialization
      localStorage.setItem(storageKey, JSON.stringify(formState));
    }
  }, [formState, storageKey, isInitialized]);

  // Save active step to localStorage when it changes
  useEffect(() => {
    if (storageKey && isInitialized) {
      localStorage.setItem(`${storageKey}_step`, activeStep.toString());
    }
  }, [activeStep, storageKey, isInitialized]);

  // Handle next step with validation
  const handleNext = (requiredFields: Array<keyof T>) => {
    if (validateStep(requiredFields)) {
      setActiveStep(prevStep => prevStep + 1);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setActiveStep(prevStep => Math.max(0, prevStep - 1));
  };

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


  return {
    formState,
    validation,
    currentError,
    updateField,
    validateField,
    setCurrentError,
    activeStep,
    handleNext,
    handlePrevious
  };
}