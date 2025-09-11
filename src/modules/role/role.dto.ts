import { z } from 'zod';

export const CreateRoleSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  show: z.boolean().optional().default(true),
});

export type CreateRoleDto = z.infer<typeof CreateRoleSchema>;
