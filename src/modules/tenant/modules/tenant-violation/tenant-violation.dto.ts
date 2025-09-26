import { z } from 'zod';

export const TenantViolationSchema = z.object({
  id: z.uuid(),
  violation: z.string().min(2).max(100),
  description: z.string().optional(),
  amount: z.number().min(0, { message: 'Amount is required' }),
});

export type TenantViolationDto = z.infer<typeof TenantViolationSchema>;
