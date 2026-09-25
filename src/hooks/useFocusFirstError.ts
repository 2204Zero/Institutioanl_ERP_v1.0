import { useEffect } from 'react';
import { FieldErrors, FieldValues } from 'react-hook-form';

/**
 * Enterprise accessibility hook automatically focusing and scrolling to the first invalid field
 */
export function useFocusFirstError<TFieldValues extends FieldValues = FieldValues>(
  errors: FieldErrors<TFieldValues>,
  isSubmitting: boolean
): void {
  useEffect(() => {
    if (isSubmitting || !errors || Object.keys(errors).length === 0) return;

    const firstErrorKey = Object.keys(errors)[0];
    if (!firstErrorKey) return;

    // Find input element by name, id, or aria attribute
    const errorElement =
      document.querySelector(`[name="${firstErrorKey}"]`) ||
      document.getElementById(firstErrorKey) ||
      document.querySelector(`[aria-invalid="true"]`);

    if (errorElement) {
      (errorElement as HTMLElement).focus();
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [errors, isSubmitting]);
}
