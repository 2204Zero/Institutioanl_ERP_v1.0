/**
 * Enterprise API Error Exception Hierarchy
 * Converts HTTP Status Codes into Strongly Typed Meaningful Exceptions
 */

export class BaseApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: any;
  public readonly timestamp: string;

  constructor(message: string, status: number = 500, code: string = 'ERR_UNKNOWN', details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AuthenticationError extends BaseApiError {
  constructor(message: string = 'Session expired or unauthenticated. Please log in again.', details?: any) {
    super(message, 401, 'ERR_UNAUTHORIZED', details);
  }
}

export class ForbiddenError extends BaseApiError {
  constructor(message: string = 'Access forbidden. You do not have permissions for this resource.', details?: any) {
    super(message, 403, 'ERR_FORBIDDEN', details);
  }
}

export class NotFoundError extends BaseApiError {
  constructor(message: string = 'The requested resource was not found on the server.', details?: any) {
    super(message, 404, 'ERR_NOT_FOUND', details);
  }
}

export class ConflictError extends BaseApiError {
  constructor(message: string = 'Resource conflict occurred. Record already exists.', details?: any) {
    super(message, 409, 'ERR_CONFLICT', details);
  }
}

export class ValidationError extends BaseApiError {
  public readonly validationErrors: Record<string, string[]>;

  constructor(message: string = 'Invalid input parameters submitted.', validationErrors: Record<string, string[]> = {}) {
    super(message, 422, 'ERR_VALIDATION_FAILED', validationErrors);
    this.validationErrors = validationErrors;
  }
}

export class RateLimitError extends BaseApiError {
  public readonly retryAfterSeconds?: number;

  constructor(message: string = 'Too many requests. Please slow down and try again.', retryAfterSeconds?: number) {
    super(message, 429, 'ERR_RATE_LIMITED', { retryAfterSeconds });
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class ServerError extends BaseApiError {
  constructor(message: string = 'Internal institutional server error occurred.', status: number = 500, details?: any) {
    super(message, status, 'ERR_INTERNAL_SERVER', details);
  }
}

export class NetworkError extends BaseApiError {
  constructor(message: string = 'Network connection failure. Please check your internet connection.') {
    super(message, 0, 'ERR_NETWORK_OFFLINE');
  }
}

export class TimeoutError extends BaseApiError {
  constructor(message: string = 'The server request timed out. Please try again.') {
    super(message, 408, 'ERR_REQUEST_TIMEOUT');
  }
}

export class UnknownError extends BaseApiError {
  constructor(message: string = 'An unexpected system error occurred.', details?: any) {
    super(message, 500, 'ERR_UNKNOWN', details);
  }
}

/**
 * Converts HTTP status codes and responses into strongly-typed exceptions
 */
export const createApiError = (status: number, message?: string, details?: any): BaseApiError => {
  switch (status) {
    case 401:
      return new AuthenticationError(message, details);
    case 403:
      return new ForbiddenError(message, details);
    case 404:
      return new NotFoundError(message, details);
    case 409:
      return new ConflictError(message, details);
    case 422:
      return new ValidationError(message, details);
    case 429:
      return new RateLimitError(message, details?.retryAfterSeconds);
    case 500:
    case 502:
    case 503:
    case 504:
      return new ServerError(message, status, details);
    case 0:
    case -1:
      return new NetworkError(message);
    case 408:
      return new TimeoutError(message);
    default:
      return new BaseApiError(message || 'HTTP Request Failed', status, `ERR_HTTP_${status}`, details);
  }
};
