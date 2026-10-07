import { z } from 'zod';
import { validators } from '../validators';

export const profileValidationSchema = z
  .object({
    fullName: validators.requiredString('Full Name', 2, 100),
    email: validators.email(),
    phone: validators.phone(),
    currentPassword: validators.optionalString(100),
    newPassword: validators.optionalString(100),
    confirmNewPassword: validators.optionalString(100),
    bio: validators.optionalString(500),
  })
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword.length > 0) {
        return data.newPassword === data.confirmNewPassword;
      }
      return true;
    },
    {
      message: 'New password and confirm password do not match.',
      path: ['confirmNewPassword'],
    }
  );

export type ProfileFormData = z.infer<typeof profileValidationSchema>;
