import { useCallback } from 'react';
import { FieldValues, UseFormReturn, DefaultValues } from 'react-hook-form';

export interface UseResetFormResult<TFieldValues extends FieldValues = FieldValues> {
  resetForm: (values?: DefaultValues<TFieldValues>) => void;
  confirmReset: (message?: string, values?: DefaultValues<TFieldValues>) => boolean;
}

export function useResetForm<TFieldValues extends FieldValues = FieldValues>(
  form: UseFormReturn<TFieldValues>
): UseResetFormResult<TFieldValues> {
  const resetForm = useCallback(
    (values?: DefaultValues<TFieldValues>) => {
      form.reset(values);
      form.clearErrors();
    },
    [form]
  );

  const confirmReset = useCallback(
    (
      message: string = 'Are you sure you want to reset all form fields? Unsaved progress will be cleared.',
      values?: DefaultValues<TFieldValues>
    ): boolean => {
      if (!form.formState.isDirty || window.confirm(message)) {
        resetForm(values);
        return true;
      }
      return false;
    },
    [form, resetForm]
  );

  return {
    resetForm,
    confirmReset,
  };
}
