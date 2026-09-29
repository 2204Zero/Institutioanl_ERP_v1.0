/**
 * Enterprise Validation Regular Expressions
 */

export const ENTERPRISE_REGEX = {
  // Standard RFC 5322 compliant Email
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  // India Phone (+91 or 10 digits starting 6-9)
  INDIA_PHONE: /^(?:\+91[\-\s]?)?[6-9]\d{9}$/,

  // International Phone E.164 standard
  E164_PHONE: /^\+?[1-9]\d{1,14}$/,

  // Student Roll Number (e.g., 2024CS108, REG-2025-88)
  ROLL_NUMBER: /^[A-Z0-9]{3,6}[\-\s]?[A-Z0-9]{2,6}$/i,

  // Employee ID (e.g. FAC-8012, EMP-992)
  EMPLOYEE_ID: /^[A-Z]{2,4}[\-\s]?\d{3,6}$/i,

  // Strong Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,

  // Indian Aadhaar (12 digits)
  AADHAAR: /^\d{12}$/,

  // Indian PAN Card (5 letters, 4 digits, 1 letter)
  PAN: /^[A-Z]{5}\d{4}[A-Z]{1}$/,

  // Passport (1 letter + 7 digits)
  PASSPORT: /^[A-Z]{1}\d{7}$/,

  // Alphanumeric with spaces
  ALPHANUMERIC: /^[a-zA-Z0-9\s._-]+$/,

  // No special characters
  NO_SPECIAL_CHARS: /^[a-zA-Z0-9\s]+$/,

  // URL
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
};
