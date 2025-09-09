import { z } from 'zod';

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(2).max(100),
  newPassword: z.string().min(2).max(100),
});

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
