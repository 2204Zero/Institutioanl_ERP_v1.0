import { z } from 'zod';
import { validators } from '../validators';

export const loginValidationSchema = z.object({
  username: validators.requiredString('Username / Institutional ID', 3, 50),
  password: z.string({ required_error: 'Password is required.' }).min(1, 'Password cannot be empty.'),
  rememberMe: z.boolean().default(true),
});

export type LoginFormData = z.infer<typeof loginValidationSchema>;
