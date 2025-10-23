import { z } from 'zod';

export const RefundSchema = z.object({
  id: z.uuid(),
  amount: z.float64().min(0),
  refundDate: z.string(),
  reason: z.string().max(500).optional(),
  bookingId: z.uuid(),
  customerId: z.uuid(),
});

export type RefundDto = z.infer<typeof RefundSchema>;
