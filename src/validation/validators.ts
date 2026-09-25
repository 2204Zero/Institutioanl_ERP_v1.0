import { z } from 'zod';
import { ENTERPRISE_REGEX } from './regex';
import { VALIDATION_MESSAGES } from './messages';

export const validators = {
  /**
   * Required trimmed string validator with min/max check
   */
  requiredString: (fieldName: string, minLen: number = 1, maxLen: number = 255) =>
    z
      .string({ required_error: VALIDATION_MESSAGES.REQUIRED(fieldName) })
      .trim()
      .min(minLen, VALIDATION_MESSAGES.MIN_LENGTH(fieldName, minLen))
      .max(maxLen, VALIDATION_MESSAGES.MAX_LENGTH(fieldName, maxLen))
      .refine((val) => val.trim().length > 0, {
        message: VALIDATION_MESSAGES.NO_WHITESPACE_ONLY,
      }),

  /**
   * Optional trimmed string validator
   */
  optionalString: (maxLen: number = 255) =>
    z
      .string()
      .trim()
      .max(maxLen)
      .optional()
      .or(z.literal('')),

  /**
   * Institutional Email Validator
   */
  email: () =>
    z
      .string({ required_error: VALIDATION_MESSAGES.REQUIRED('Email Address') })
      .trim()
      .toLowerCase()
      .regex(ENTERPRISE_REGEX.EMAIL, VALIDATION_MESSAGES.INVALID_EMAIL),

  /**
   * Indian & International Phone Validator
   */
  phone: () =>
    z
      .string({ required_error: VALIDATION_MESSAGES.REQUIRED('Phone Number') })
      .trim()
      .regex(ENTERPRISE_REGEX.INDIA_PHONE, VALIDATION_MESSAGES.INVALID_PHONE),

  /**
   * Strong Enterprise Password Validator
   */
  password: () =>
    z
      .string({ required_error: VALIDATION_MESSAGES.REQUIRED('Password') })
      .min(8, VALIDATION_MESSAGES.MIN_LENGTH('Password', 8))
      .regex(ENTERPRISE_REGEX.STRONG_PASSWORD, VALIDATION_MESSAGES.PASSWORD_WEAK),

  /**
   * Numeric range validator
   */
  numberRange: (fieldName: string, min: number, max: number) =>
    z.coerce
      .number({ required_error: VALIDATION_MESSAGES.REQUIRED(fieldName) })
      .min(min, VALIDATION_MESSAGES.NUMERIC_MIN(fieldName, min))
      .max(max, VALIDATION_MESSAGES.NUMERIC_MAX(fieldName, max)),

  /**
   * Positive Number Restrictive Validator
   */
  positiveNumber: (fieldName: string) =>
    z.coerce
      .number({ required_error: VALIDATION_MESSAGES.REQUIRED(fieldName) })
      .gt(0, VALIDATION_MESSAGES.POSITIVE_ONLY(fieldName)),

  /**
   * Non-negative Number Validator (0 or greater)
   */
  nonNegativeNumber: (fieldName: string) =>
    z.coerce
      .number({ required_error: VALIDATION_MESSAGES.REQUIRED(fieldName) })
      .gte(0, VALIDATION_MESSAGES.NON_NEGATIVE(fieldName)),

  /**
   * Past Date Validator (e.g. Birth Date)
   */
  pastDate: (fieldName: string = 'Date of Birth') =>
    z.coerce
      .date({ required_error: VALIDATION_MESSAGES.REQUIRED(fieldName) })
      .refine((d) => d < new Date(), { message: VALIDATION_MESSAGES.PAST_DATE_REQUIRED }),

  /**
   * Minimum Age Validator (e.g. Age >= 17 for University Admission)
   */
  minAge: (minAgeYears: number = 17) =>
    z.coerce.date({ required_error: VALIDATION_MESSAGES.REQUIRED('Date of Birth') }).refine(
      (dob) => {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age >= minAgeYears;
      },
      { message: VALIDATION_MESSAGES.AGE_MIN(minAgeYears) }
    ),

  /**
   * Roll Number Validator
   */
  rollNumber: () =>
    z
      .string({ required_error: VALIDATION_MESSAGES.REQUIRED('Roll Number') })
      .trim()
      .toUpperCase()
      .regex(ENTERPRISE_REGEX.ROLL_NUMBER, VALIDATION_MESSAGES.INVALID_ROLL_NUMBER),

  /**
   * Employee ID Validator
   */
  employeeId: () =>
    z
      .string({ required_error: VALIDATION_MESSAGES.REQUIRED('Employee ID') })
      .trim()
      .toUpperCase()
      .regex(ENTERPRISE_REGEX.EMPLOYEE_ID, VALIDATION_MESSAGES.INVALID_EMPLOYEE_ID),
};
