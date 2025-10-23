import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.email(),
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  roleId: z.uuid(),
  password: z.string().min(6).max(100).optional(),
});

export const UpdateUserSchema = z.object({
  id: z.string().uuid(),
  email: z.email(),
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  profilePicture: z.string().optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(2).max(100),
  newPassword: z.string().min(2).max(100),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
