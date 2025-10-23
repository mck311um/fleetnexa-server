import { z } from 'zod';

export const PaymentSchema = z.object({
  id: z.uuid(),
  amount: z.float64().min(0),
  paymentDate: z.string(),
  notes: z.string().max(500).optional(),
  bookingId: z.uuid(),
  paymentMethodId: z.uuid(),
  paymentTypeId: z.uuid(),
  customerId: z.uuid(),
});

export type PaymentDto = z.infer<typeof PaymentSchema>;
