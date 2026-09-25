import { useState, useCallback } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { BaseApiError } from '../errors/apiErrors';
import { errorFormatter } from '../validation/errorFormatter';

export interface UseFormSubmitOptions<TFieldValues extends FieldValues, TResult = any> {
  onSubmit: (data: TFieldValues) => Promise<TResult>;
  onSuccess?: (result: TResult) => void;
  onError?: (error: BaseApiError | Error) => void;
  form?: UseFormReturn<TFieldValues>;
}

export interface UseFormSubmitResult<TFieldValues extends FieldValues, TResult = any> {
  submitHandler: (data: TFieldValues) => Promise<void>;
  isSubmitting: boolean;
  submitError: BaseApiError | Error | null;
  submitSuccess: boolean;
  resetSubmitState: () => void;
}

export function useFormSubmit<TFieldValues extends FieldValues = FieldValues, TResult = any>({
  onSubmit,
  onSuccess,
  onError,
  form,
}: UseFormSubmitOptions<TFieldValues, TResult>): UseFormSubmitResult<TFieldValues, TResult> {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<BaseApiError | Error | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const submitHandler = useCallback(
    async (data: TFieldValues) => {
      if (isSubmitting) return; // Prevent duplicate submissions

      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      try {
        const result = await onSubmit(data);
        setSubmitSuccess(true);
        if (onSuccess) onSuccess(result);
      } catch (err: any) {
        setSubmitError(err);

        // Map HTTP 422 errors automatically if form provided
        if (form && err instanceof BaseApiError) {
          errorFormatter.mapApiErrorsToForm<TFieldValues>(err, form.setError);
        }

        if (onError) onError(err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, onSuccess, onError, form, isSubmitting]
  );

  const resetSubmitState = useCallback(() => {
    setIsSubmitting(false);
    setSubmitError(null);
    setSubmitSuccess(false);
  }, []);

  return {
    submitHandler,
    isSubmitting,
    submitError,
    submitSuccess,
    resetSubmitState,
  };
}
