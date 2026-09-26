import { BaseApiError, createApiError, ValidationError } from '../errors/apiErrors';

export { BaseApiError, createApiError, ValidationError };

export interface ParsedError {
  message: string;
  code: string;
  status: number;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
  timestamp: string;
}

export const parseApiError = (error: unknown): ParsedError => {
  if (error instanceof BaseApiError) {
    const fieldErrors = error instanceof ValidationError ? error.validationErrors : undefined;
    return {
      message: error.message,
      code: error.code,
      status: error.status,
      fieldErrors,
      requestId: error.requestId,
      timestamp: error.timestamp,
    };
  }

  if (error && typeof error === 'object') {
    const errObj = error as Record<string, unknown>;
    const message = typeof errObj.message === 'string' ? errObj.message : 'An unexpected error occurred';
    const code = typeof errObj.code === 'string' ? errObj.code : 'ERR_UNKNOWN';
    const status = typeof errObj.status === 'number' ? errObj.status : 500;
    return {
      message,
      code,
      status,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    message: typeof error === 'string' ? error : 'An unexpected application error occurred',
    code: 'ERR_UNKNOWN',
    status: 500,
    timestamp: new Date().toISOString(),
  };
};

export const getErrorMessage = (error: unknown, fallback: string = 'Operation failed'): string => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error instanceof BaseApiError) return error.message;
  if (error instanceof Error) return error.message;
  const parsed = parseApiError(error);
  return parsed.message || fallback;
};

export const extractFieldErrors = (error: unknown): Record<string, string> => {
  if (error instanceof ValidationError && error.validationErrors) {
    const result: Record<string, string> = {};
    Object.entries(error.validationErrors).forEach(([field, msgs]) => {
      if (Array.isArray(msgs) && msgs.length > 0) {
        result[field] = msgs[0];
      }
    });
    return result;
  }
  return {};
};
