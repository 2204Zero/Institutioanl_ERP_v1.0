import { z } from 'zod';
import { validators } from '../validators';

export const departmentCreationSchema = z.object({
  code: validators.requiredString('Department Code', 2, 10),
  name: validators.requiredString('Department Name', 3, 100),
  institutionId: validators.requiredString('Parent Institution'),
  hodEmployeeId: validators.optionalString(50),
  intakeCapacity: validators.positiveNumber('Annual Student Intake Capacity'),
  buildingBlock: validators.requiredString('Building Block Location', 2, 50),
  establishedYear: validators.numberRange('Established Year', 1950, 2030),
  isActive: z.boolean().default(true),
  description: validators.optionalString(500),
});

export type DepartmentCreationFormData = z.infer<typeof departmentCreationSchema>;
