import { useState, useCallback } from 'react';
import { BaseApiError, createApiError } from '../errors/apiErrors';

export interface UseErrorResult {
  errors: Record<string, BaseApiError | null>;
  setError: (key: string, error: BaseApiError | Error | string | number) => void;
  clearError: (key: string) => void;
  clearAllErrors: () => void;
  hasError: (key?: string) => boolean;
  getError: (key: string) => BaseApiError | null;
  getErrorMessage: (key: string, fallback?: string) => string;
  isHttpError: (key: string, status: number) => boolean;
}

export function useError(initialErrors: Record<string, BaseApiError | null> = {}): UseErrorResult {
  const [errors, setErrors] = useState<Record<string, BaseApiError | null>>(initialErrors);

  const setError = useCallback((key: string, error: BaseApiError | Error | string | number) => {
    let formattedErr: BaseApiError;

    if (error instanceof BaseApiError) {
      formattedErr = error;
    } else if (typeof error === 'number') {
      formattedErr = createApiError(error);
    } else if (typeof error === 'string') {
      formattedErr = createApiError(500, error);
    } else if (error instanceof Error) {
      formattedErr = createApiError(500, error.message);
    } else {
      formattedErr = createApiError(500, 'An unknown error occurred');
    }

    setErrors((prev) => ({ ...prev, [key]: formattedErr }));
  }, []);

  const clearError = useCallback((key: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasError = useCallback(
    (key?: string) => {
      if (key) return !!errors[key];
      return Object.values(errors).some((e) => e !== null);
    },
    [errors]
  );

  const getError = useCallback((key: string) => errors[key] || null, [errors]);

  const getErrorMessage = useCallback(
    (key: string, fallback: string = 'An error occurred. Please try again.') => {
      const err = errors[key];
      return err?.message || fallback;
    },
    [errors]
  );

  const isHttpError = useCallback(
    (key: string, status: number) => {
      const err = errors[key];
      return err?.status === status;
    },
    [errors]
  );

  return {
    errors,
    setError,
    clearError,
    clearAllErrors,
    hasError,
    getError,
    getErrorMessage,
    isHttpError,
  };
}
