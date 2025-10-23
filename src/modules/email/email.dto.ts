import { z } from 'zod';

export const SendBookingDocumentsSchema = z.object({
  bookingId: z.uuid(),
  to: z.email(),
  includeInvoice: z.boolean().default(false),
  includeAgreement: z.boolean().default(false),
});

export type SendBookingDocumentsDto = z.infer<
  typeof SendBookingDocumentsSchema
>;
