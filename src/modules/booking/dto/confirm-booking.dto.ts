import { RentalAction } from "@prisma/client";
import { z } from "zod";

export const ConfirmBookingDtoSchema = z.object({
  bookingId: z.uuid(),
  action: z.enum(RentalAction),
});

export type ConfirmBookingDto = z.infer<typeof ConfirmBookingDtoSchema>;
