import z from 'zod';

export const CustomerViolationSchema = z.object({
  id: z.uuid(),
  customerId: z.uuid(),
  violationId: z.uuid(),
  violationDate: z.string(),
  notes: z.string().optional(),
});

export type CustomerViolationDto = z.infer<typeof CustomerViolationSchema>;
