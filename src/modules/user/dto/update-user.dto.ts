import { z } from 'zod';

export const UpdateUserSchema = z.object({
  email: z.email(),
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  profilePicture: z.string().optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
