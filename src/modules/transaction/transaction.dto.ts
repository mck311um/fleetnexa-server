import { TransactionType } from '@prisma/client';
import { z } from 'zod';

export const TransactionSchema = z.object({
  id: z.uuid(),
  amount: z.float64(),
  transactionDate: z.string(),
  type: z.enum(TransactionType),
  createdBy: z.string().optional(),
  paymentId: z.string().optional(),
  refundId: z.string().optional(),
  expenseId: z.string().optional(),
  rentalId: z.string().optional(),
});

export type TransactionDto = z.infer<typeof TransactionSchema>;
