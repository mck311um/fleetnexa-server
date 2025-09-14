import { z } from 'zod';
import { vi } from 'zod/v4/locales/index.cjs';

export const CustomerViolationSchema = z.object({
  id: z.uuid(),
  customerId: z.uuid(),
  violationId: z.uuid(),
  violationDate: z.string(),
  notes: z.string().optional(),
});

export type CustomerViolationDto = z.infer<typeof CustomerViolationSchema>;
