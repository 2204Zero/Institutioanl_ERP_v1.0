import { z } from 'zod';
import { validators } from '../validators';

export const teacherRegistrationSchema = z.object({
  employeeId: validators.employeeId(),
  fullName: validators.requiredString('Faculty Full Name', 3, 100),
  email: validators.email(),
  phone: validators.phone(),
  departmentId: validators.requiredString('Department'),
  designation: z.enum(
    ['Professor & HOD', 'Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Research Scholar'],
    { required_error: 'Please select academic designation.' }
  ),
  qualification: validators.requiredString('Highest Educational Qualification', 2, 100),
  experienceYears: validators.nonNegativeNumber('Years of Experience'),
  joiningDate: validators.pastDate('Joining Date'),
  salaryGrade: validators.requiredString('Salary Pay Grade'),
  isFullTime: z.boolean().default(true),
});

export type TeacherRegistrationFormData = z.infer<typeof teacherRegistrationSchema>;
