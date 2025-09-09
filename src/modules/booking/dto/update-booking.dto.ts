import { z } from 'zod';
import { CreateBookingDtoSchema } from './create-booking.dto';
import { RentalStatus } from '@prisma/client';

export const UpdateBookingDtoSchema = CreateBookingDtoSchema.extend({
  bookingCode: z.string().optional(),
  bookingNumber: z.string().optional(),
  status: z.enum(RentalStatus),
});

export type UpdateBookingDto = z.infer<typeof UpdateBookingDtoSchema>;
