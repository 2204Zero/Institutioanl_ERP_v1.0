import { useState, useEffect, useCallback } from 'react';

export interface UseAsyncValidationProps<T> {
  value: T;
  validatorFn: (value: T) => Promise<boolean | string>;
  debounceMs?: number;
  enabled?: boolean;
}

export interface UseAsyncValidationResult {
  isValidating: boolean;
  isValid: boolean | null;
  errorMessage: string | null;
  revalidate: () => Promise<void>;
}

export function useAsyncValidation<T = string>({
  value,
  validatorFn,
  debounceMs = 400,
  enabled = true,
}: UseAsyncValidationProps<T>): UseAsyncValidationResult {
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const performValidation = useCallback(async (val: T) => {
    setIsValidating(true);
    setErrorMessage(null);

    try {
      const result = await validatorFn(val);
      if (typeof result === 'boolean') {
        setIsValid(result);
        setErrorMessage(result ? null : 'This value is already taken or invalid.');
      } else {
        setIsValid(false);
        setErrorMessage(result);
      }
    } catch (err: any) {
      setIsValid(false);
      setErrorMessage(err?.message || 'Async validation failed.');
    } finally {
      setIsValidating(false);
    }
  }, [validatorFn]);

  useEffect(() => {
    if (!enabled || value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
      setIsValidating(false);
      setIsValid(null);
      setErrorMessage(null);
      return;
    }

    const timer = setTimeout(() => {
      performValidation(value);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, debounceMs, enabled, performValidation]);

  return {
    isValidating,
    isValid,
    errorMessage,
    revalidate: () => performValidation(value),
  };
}
