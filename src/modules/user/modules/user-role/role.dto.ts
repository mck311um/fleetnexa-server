import { z } from 'zod';

export const UserRoleSchema = z.object({
  id: z.uuid(),
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  show: z.boolean().optional().default(true),
});

export type UserRoleDto = z.infer<typeof UserRoleSchema>;
