import { z } from 'zod';

export const CreateViolationSchema = z.object({
  violation: z.string().min(2).max(100),
  description: z.string().optional(),
  amount: z.number().min(0, { message: 'Amount is required' }),
});

export type CreateViolationDto = z.infer<typeof CreateViolationSchema>;
