import { email, z } from 'zod';

export const LoginDtoSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
  rememberMe: z.boolean().optional(),
});

export type LoginDto = z.infer<typeof LoginDtoSchema>;

export const AdminUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email().max(100),
});

export type AdminUserDto = z.infer<typeof AdminUserSchema>;
