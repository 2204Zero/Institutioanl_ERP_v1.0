/**
 * Localization-Ready Enterprise Validation Messages
 */

export const VALIDATION_MESSAGES = {
  REQUIRED: (fieldName: string = 'Field') => `${fieldName} is required.`,
  INVALID_EMAIL: 'Please enter a valid institutional email address (e.g. user@institution.edu).',
  INVALID_PHONE: 'Please enter a valid 10-digit mobile number (+91 9876543210).',
  PASSWORD_WEAK: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character (@$!%*?&).',
  PASSWORD_MISMATCH: 'Password and Confirm Password do not match.',
  MIN_LENGTH: (fieldName: string, min: number) => `${fieldName} must be at least ${min} characters.`,
  MAX_LENGTH: (fieldName: string, max: number) => `${fieldName} cannot exceed ${max} characters.`,
  NUMERIC_MIN: (fieldName: string, min: number) => `${fieldName} must be greater than or equal to ${min}.`,
  NUMERIC_MAX: (fieldName: string, max: number) => `${fieldName} cannot exceed ${max}.`,
  POSITIVE_ONLY: (fieldName: string = 'Value') => `${fieldName} must be a positive number greater than zero.`,
  NON_NEGATIVE: (fieldName: string = 'Value') => `${fieldName} cannot be negative.`,
  INVALID_DATE: 'Please enter a valid date format.',
  PAST_DATE_REQUIRED: 'Date must be in the past.',
  FUTURE_DATE_REQUIRED: 'Date must be in the future.',
  AGE_MIN: (minAge: number = 17) => `Student must be at least ${minAge} years old for institutional admission.`,
  INVALID_ROLL_NUMBER: 'Invalid Roll Number format (e.g. 2024CS108).',
  INVALID_EMPLOYEE_ID: 'Invalid Employee ID format (e.g. FAC-8012).',
  FILE_SIZE_LIMIT: (maxMb: number) => `File size exceeds the maximum limit of ${maxMb} MB.`,
  FILE_TYPE_INVALID: (allowed: string) => `Invalid file type. Allowed formats: ${allowed}.`,
  NO_WHITESPACE_ONLY: 'Value cannot consist only of empty whitespace.',
  FORBIDDEN_CHARS: 'Field contains prohibited characters.',
};
