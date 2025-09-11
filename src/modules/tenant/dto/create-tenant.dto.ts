import { z } from 'zod';

export const CreateTenantSchema = z.object({
  tenantName: z.string().min(2).max(100),
  email: z.email(),
  number: z.string().min(10).max(15),
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
});

export type CreateTenantDto = z.infer<typeof CreateTenantSchema>;
