/**
 * Centralized API & System Environment Configuration Layer
 * Supports Development, Staging & Production Environments
 */

const getEnvVariable = (key: string, defaultValue: string): string => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  // Vite environment variable support
  const meta = import.meta as any;
  if (meta && meta.env && meta.env[key]) {
    return meta.env[key] as string;
  }
  return defaultValue;
};

export const API_CONFIG = {
  BASE_URL: getEnvVariable('VITE_API_BASE_URL', 'https://api.erp.institution.edu/v1'),
  TIMEOUT: parseInt(getEnvVariable('VITE_API_TIMEOUT', '15000'), 10),
  API_VERSION: 'v1',
  AUTH_HEADER_PREFIX: 'Bearer',
  HEADER_KEYS: {
    AUTHORIZATION: 'Authorization',
    CONTENT_TYPE: 'Content-Type',
    ACCEPT: 'Accept',
    CLIENT_VERSION: 'X-Client-Version',
    REQUEST_ID: 'X-Request-ID',
    CORRELATION_ID: 'X-Correlation-ID',
  },
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client-Version': '2.4.0',
    'X-Platform': 'Web-Enterprise',
  },
  RETRY: {
    MAX_RETRIES: 3,
    INITIAL_DELAY_MS: 1000,
    MAX_DELAY_MS: 5000,
    BACKOFF_FACTOR: 2,
    RETRYABLE_STATUS_CODES: [408, 429, 500, 502, 503, 504],
  },
  CACHE: {
    DEFAULT_TTL_MS: 5 * 60 * 1000, // 5 minutes
    MAX_ENTRIES: 500,
  },
  IS_DEV: getEnvVariable('NODE_ENV', 'development') === 'development',
  IS_PROD: getEnvVariable('NODE_ENV', 'development') === 'production',
  USE_MOCK: getEnvVariable('VITE_USE_MOCK_API', 'true') === 'true',
};
