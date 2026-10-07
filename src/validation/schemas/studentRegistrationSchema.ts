import { z } from 'zod';
import { validators } from '../validators';

export const studentRegistrationSchema = z
  .object({
    // Personal Details
    firstName: validators.requiredString('First Name', 2, 50),
    lastName: validators.requiredString('Last Name', 1, 50),
    email: validators.email(),
    confirmEmail: validators.email(),
    phone: validators.phone(),
    gender: z.enum(['Male', 'Female', 'Other'], {
      required_error: 'Please select student gender.',
    }),
    dateOfBirth: validators.minAge(17),

    // Cascading Academic Structure
    institutionId: validators.requiredString('Institution'),
    departmentId: validators.requiredString('Department'),
    programId: validators.requiredString('Degree Program'),
    semesterId: validators.requiredString('Semester'),
    sectionId: validators.requiredString('Section'),
    rollNo: validators.rollNumber(),
    admissionYear: validators.numberRange('Admission Year', 2020, 2030),

    // Conditional Hostel Fields
    requiresHostel: z.boolean().default(false),
    hostelBuilding: z.string().optional(),
    roomType: z.enum(['Single', 'Double', 'Triple']).optional(),

    // Guardian Details
    guardianName: validators.requiredString('Guardian Name', 2, 100),
    guardianPhone: validators.phone(),
    guardianRelation: validators.requiredString('Relation to Student', 2, 50),

    // Documents & Agreements
    agreeTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must accept institutional regulations to proceed.' }),
    }),
  })
  .refine((data) => data.email === data.confirmEmail, {
    message: 'Email and Confirm Email do not match.',
    path: ['confirmEmail'],
  })
  .refine(
    (data) => {
      if (data.requiresHostel) {
        return !!data.hostelBuilding && data.hostelBuilding.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Hostel building selection is required when hostel accommodation is requested.',
      path: ['hostelBuilding'],
    }
  );

export type StudentRegistrationFormData = z.infer<typeof studentRegistrationSchema>;
