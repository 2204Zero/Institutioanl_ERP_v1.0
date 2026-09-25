import { useCallback } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { BaseApiError } from '../errors/apiErrors';
import { errorFormatter } from '../validation/errorFormatter';

export interface UseFormErrorsResult<TFieldValues extends FieldValues = FieldValues> {
  mapApiErrors: (apiError: BaseApiError | null) => void;
  clearFormErrors: () => void;
  getFieldError: (fieldName: keyof TFieldValues) => string | undefined;
}

export function useFormErrors<TFieldValues extends FieldValues = FieldValues>(
  form: UseFormReturn<TFieldValues>
): UseFormErrorsResult<TFieldValues> {
  const mapApiErrors = useCallback(
    (apiError: BaseApiError | null) => {
      if (!apiError) return;
      errorFormatter.mapApiErrorsToForm<TFieldValues>(apiError, form.setError);
    },
    [form]
  );

  const clearFormErrors = useCallback(() => {
    form.clearErrors();
  }, [form]);

  const getFieldError = useCallback(
    (fieldName: keyof TFieldValues): string | undefined => {
      const errorObj = form.formState.errors[fieldName as any];
      return errorObj?.message as string | undefined;
    },
    [form.formState.errors]
  );

  return {
    mapApiErrors,
    clearFormErrors,
    getFieldError,
  };
}
