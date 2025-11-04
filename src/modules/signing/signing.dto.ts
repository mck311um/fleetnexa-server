import { z } from 'zod';

export const SendAgreementForSigningSchema = z.object({
  bookingId: z.uuid(),
  userId: z.string(),
  driverEmail: z.email(),
});

export type SendAgreementForSigningDto = z.infer<
  typeof SendAgreementForSigningSchema
>;
