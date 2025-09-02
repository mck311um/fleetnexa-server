import { RentalAction, RentalStatus } from "@prisma/client";
import { z } from "zod";

export const ActionBookingDtoSchema = z.object({
  bookingId: z.uuid(),
  action: z.enum(RentalAction),
  status: z.enum(RentalStatus),
  vehicleStatus: z.string(),
  returnDate: z.string().optional(),
  lateFeeApplied: z.boolean().default(false),
  lateFee: z.float64().min(0).optional(),
});

export type ActionBookingDto = z.infer<typeof ActionBookingDtoSchema>;
