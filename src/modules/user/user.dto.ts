import { email, z } from 'zod';

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

export const NewPasswordSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(100),
});

export const RequestPasswordResetSchema = z.object({
  username: z.string(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;

export type RequestPasswordResetDto = z.infer<
  typeof RequestPasswordResetSchema
>;

export type NewPasswordDto = z.infer<typeof NewPasswordSchema>;
