import { z } from 'zod';
import { validators } from '../validators';

export const institutionSchema = z.object({
  institutionCode: validators.requiredString('Institution Code', 2, 15),
  name: validators.requiredString('Institution Name', 5, 150),
  accreditationGrade: z.enum(['NAAC A++', 'NAAC A+', 'NAAC A', 'NBA Accredited', 'Autonomous'], {
    required_error: 'Please select accreditation status.',
  }),
  contactEmail: validators.email(),
  contactPhone: validators.phone(),
  websiteUrl: z.string().url('Please enter a valid website URL (e.g. https://nits.edu)').or(z.literal('')),
  addressLine1: validators.requiredString('Address Line 1', 5, 200),
  city: validators.requiredString('City', 2, 50),
  state: validators.requiredString('State / Province', 2, 50),
  postalCode: validators.requiredString('Postal Pincode', 6, 10),
});

export type InstitutionFormData = z.infer<typeof institutionSchema>;
