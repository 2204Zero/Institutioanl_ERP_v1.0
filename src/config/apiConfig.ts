/**
 * Centralized API & System Environment Configuration Layer
 * Supports Development, Testing/Staging & Production Environments
 * Enterprise ERP System - Day 06 Integration Architecture
 */

export type EnvironmentType = 'development' | 'testing' | 'production';

const getEnvVariable = (key: string, defaultValue: string): string => {
  // Vite environment variables
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    const viteEnv = (import.meta as any).env;
    if (viteEnv[key] !== undefined && viteEnv[key] !== '') {
      return String(viteEnv[key]);
    }
    // Also check standard MODE
    if (key === 'NODE_ENV' && viteEnv.MODE) {
      return String(viteEnv.MODE);
    }
  }

  // Node.js process.env fallback for testing / scripts
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }

  return defaultValue;
};

const resolveEnvironment = (): EnvironmentType => {
  const env = getEnvVariable('VITE_APP_ENV', getEnvVariable('NODE_ENV', 'development')).toLowerCase();
  if (env.includes('prod')) return 'production';
  if (env.includes('test') || env.includes('stag')) return 'testing';
  return 'development';
};

const CURRENT_ENV = resolveEnvironment();

export const API_CONFIG = {
  ENVIRONMENT: CURRENT_ENV,
  IS_DEV: CURRENT_ENV === 'development',
  IS_TEST: CURRENT_ENV === 'testing',
  IS_PROD: CURRENT_ENV === 'production',

  // Base URL: Points to Spring Boot API gateway or direct microservices
  BASE_URL: getEnvVariable('VITE_API_BASE_URL', CURRENT_ENV === 'production' ? 'https://api.erp.institution.edu/v1' : 'http://localhost:8080'),
  TIMEOUT: parseInt(getEnvVariable('VITE_API_TIMEOUT', '15000'), 10),
  API_VERSION: getEnvVariable('VITE_API_VERSION', 'v1'),
  USE_MOCK: getEnvVariable('VITE_USE_MOCK_API', 'false') === 'true',

  AUTH_HEADER_PREFIX: 'Bearer',

  HEADER_KEYS: {
    AUTHORIZATION: 'Authorization',
    CONTENT_TYPE: 'Content-Type',
    ACCEPT: 'Accept',
    CLIENT_VERSION: 'X-Client-Version',
    REQUEST_ID: 'X-Request-ID',
    CORRELATION_ID: 'X-Correlation-ID',
    PLATFORM: 'X-Platform',
  } as const,

  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client-Version': '2.4.0',
    'X-Platform': 'Web-Enterprise-ERP',
  } as const,

  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
    },
    STUDENTS: {
      BASE: '/students',
      BY_ID: (id: string) => `/students/${id}`,
      SEARCH: '/students/search',
      FILTER: '/students/filter',
      EXPORT: '/students/export',
    },
    SYSTEM: {
      HEALTH: '/actuator/health',
      STATUS: '/api/status',
    },
  } as const,

  RETRY: {
    MAX_RETRIES: 3,
    INITIAL_DELAY_MS: 1000,
    MAX_DELAY_MS: 5000,
    BACKOFF_FACTOR: 2,
    RETRYABLE_STATUS_CODES: [408, 429, 500, 502, 503, 504],
  } as const,

  CACHE: {
    DEFAULT_TTL_MS: 5 * 60 * 1000, // 5 minutes
    MAX_ENTRIES: 500,
  } as const,
};
