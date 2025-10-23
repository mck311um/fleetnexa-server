import { string, z } from 'zod';

export const ExpenseSchema = z.object({
  id: z.uuid(),
  amount: z.float64().min(0),
  expenseDate: z.string(),
  expense: string(),
  payee: string(),
  notes: z.string().max(500).optional(),
  vendorId: z.uuid().optional(),
  vehicleId: z.uuid().optional(),
  maintenanceId: z.uuid().optional(),
});

export type ExpenseDto = z.infer<typeof ExpenseSchema>;
