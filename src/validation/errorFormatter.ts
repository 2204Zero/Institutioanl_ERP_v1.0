import { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { BaseApiError, ValidationError } from '../errors/apiErrors';

export interface FormattedFieldError {
  field: string;
  message: string;
}

export const errorFormatter = {
  /**
   * Maps Spring Boot backend 422 HTTP validation errors directly to React Hook Form field errors
   */
  mapApiErrorsToForm<TFieldValues extends FieldValues = FieldValues>(
    apiError: BaseApiError | null,
    setError: UseFormSetError<TFieldValues>
  ): FormattedFieldError[] {
    if (!apiError) return [];

    const formattedList: FormattedFieldError[] = [];

    // Check if error contains field-specific details map
    if (apiError instanceof ValidationError && apiError.validationErrors) {
      Object.entries(apiError.validationErrors).forEach(([field, messages]) => {
        const msg = Array.isArray(messages) ? messages[0] : String(messages);
        setError(field as Path<TFieldValues>, {
          type: 'server',
          message: msg,
        });
        formattedList.push({ field, message: msg });
      });
    } else if (apiError.details && typeof apiError.details === 'object') {
      Object.entries(apiError.details).forEach(([field, messages]) => {
        const msg = Array.isArray(messages) ? messages[0] : String(messages);
        setError(field as Path<TFieldValues>, {
          type: 'server',
          message: msg,
        });
        formattedList.push({ field, message: msg });
      });
    }

    return formattedList;
  },

  /**
   * Extract human-readable primary error message
   */
  getPrimaryErrorMessage(apiError: BaseApiError | null): string | null {
    if (!apiError) return null;
    return apiError.message || 'An unexpected form validation error occurred.';
  },
};
