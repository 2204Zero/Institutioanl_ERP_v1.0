/**
 * Enterprise API Error Exception Hierarchy
 * Maps all HTTP Status Codes (400, 401, 403, 404, 409, 422, 429, 500, 502, 503, 504, Network, Timeout)
 * Into Strongly Typed Domain Exceptions with User-Friendly Localization Messages
 */

export class BaseApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown> | null;
  public readonly timestamp: string;
  public readonly requestId?: string;

  constructor(
    message: string,
    status: number = 500,
    code: string = 'ERR_UNKNOWN',
    details?: Record<string, unknown> | null,
    requestId?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
    this.timestamp = new Date().toISOString();
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends BaseApiError {
  constructor(message: string = 'Bad request. The server could not process the provided data.', details?: Record<string, unknown> | null, requestId?: string) {
    super(message, 400, 'ERR_BAD_REQUEST', details, requestId);
  }
}

export class AuthenticationError extends BaseApiError {
  constructor(message: string = 'Session expired or invalid credentials. Please log in again.', details?: Record<string, unknown> | null, requestId?: string) {
    super(message, 401, 'ERR_UNAUTHORIZED', details, requestId);
  }
}

export class ForbiddenError extends BaseApiError {
  constructor(message: string = 'Access forbidden. You do not have permissions to access this institutional resource.', details?: Record<string, unknown> | null, requestId?: string) {
    super(message, 403, 'ERR_FORBIDDEN', details, requestId);
  }
}

export class NotFoundError extends BaseApiError {
  constructor(message: string = 'The requested ERP record was not found on the server.', details?: Record<string, unknown> | null, requestId?: string) {
    super(message, 404, 'ERR_NOT_FOUND', details, requestId);
  }
}

export class ConflictError extends BaseApiError {
  constructor(message: string = 'Conflict detected. A record with identical identifier already exists.', details?: Record<string, unknown> | null, requestId?: string) {
    super(message, 409, 'ERR_CONFLICT', details, requestId);
  }
}

export class ValidationError extends BaseApiError {
  public readonly validationErrors: Record<string, string[]>;

  constructor(
    message: string = 'Form validation failure. Please correct the highlighted fields.',
    validationErrors: Record<string, string[]> = {},
    requestId?: string
  ) {
    super(message, 422, 'ERR_VALIDATION_FAILED', validationErrors as Record<string, unknown>, requestId);
    this.validationErrors = validationErrors;
  }
}

export class RateLimitError extends BaseApiError {
  public readonly retryAfterSeconds?: number;

  constructor(message: string = 'Too many requests. Please slow down and try again shortly.', retryAfterSeconds?: number, requestId?: string) {
    super(message, 429, 'ERR_RATE_LIMITED', { retryAfterSeconds }, requestId);
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class ServerError extends BaseApiError {
  constructor(message: string = 'Internal institutional server error occurred. Please contact IT support.', status: number = 500, details?: Record<string, unknown> | null, requestId?: string) {
    super(message, status, 'ERR_INTERNAL_SERVER', details, requestId);
  }
}

export class BadGatewayError extends ServerError {
  constructor(message: string = 'Bad Gateway (502). Upstream ERP service received an invalid response.', details?: Record<string, unknown> | null, requestId?: string) {
    super(message, 502, details, requestId);
  }
}

export class ServiceUnavailableError extends ServerError {
  constructor(message: string = 'Service Temporarily Unavailable (503). Server maintenance in progress.', details?: Record<string, unknown> | null, requestId?: string) {
    super(message, 503, details, requestId);
  }
}

export class GatewayTimeoutError extends ServerError {
  constructor(message: string = 'Gateway Timeout (504). Institutional backend gateway did not receive timely response.', details?: Record<string, unknown> | null, requestId?: string) {
    super(message, 504, details, requestId);
  }
}

export class NetworkError extends BaseApiError {
  constructor(message: string = 'Network connection offline or blocked. Verify your internet connection.', requestId?: string) {
    super(message, 0, 'ERR_NETWORK_OFFLINE', null, requestId);
  }
}

export class TimeoutError extends BaseApiError {
  constructor(message: string = 'The request timed out before receiving a response from the server.', requestId?: string) {
    super(message, 408, 'ERR_REQUEST_TIMEOUT', null, requestId);
  }
}

export class UnknownError extends BaseApiError {
  constructor(message: string = 'An unexpected system error occurred.', details?: Record<string, unknown> | null, requestId?: string) {
    super(message, 500, 'ERR_UNKNOWN', details, requestId);
  }
}

/**
 * Enterprise factory mapping status codes to strongly-typed exceptions
 */
export const createApiError = (
  status: number,
  message?: string,
  details?: Record<string, unknown> | null,
  requestId?: string
): BaseApiError => {
  switch (status) {
    case 400:
      return new BadRequestError(message, details, requestId);
    case 401:
      return new AuthenticationError(message, details, requestId);
    case 403:
      return new ForbiddenError(message, details, requestId);
    case 404:
      return new NotFoundError(message, details, requestId);
    case 409:
      return new ConflictError(message, details, requestId);
    case 422:
      return new ValidationError(message, (details as Record<string, string[]>) || {}, requestId);
    case 429:
      return new RateLimitError(message, typeof details?.retryAfterSeconds === 'number' ? details.retryAfterSeconds : undefined, requestId);
    case 500:
      return new ServerError(message, 500, details, requestId);
    case 502:
      return new BadGatewayError(message, details, requestId);
    case 503:
      return new ServiceUnavailableError(message, details, requestId);
    case 504:
      return new GatewayTimeoutError(message, details, requestId);
    case 0:
    case -1:
      return new NetworkError(message, requestId);
    case 408:
      return new TimeoutError(message, requestId);
    default:
      return new BaseApiError(message || `HTTP Request failed with status ${status}`, status, `ERR_HTTP_${status}`, details, requestId);
  }
};
