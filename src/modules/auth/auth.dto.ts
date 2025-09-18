import { z } from 'zod';

export const LoginDtoSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
  rememberMe: z.boolean().optional(),
});

export type LoginDto = z.infer<typeof LoginDtoSchema>;
