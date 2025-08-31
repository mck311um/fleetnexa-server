import { RentalAction } from "@prisma/client";
import { z } from "zod";

export const RentalActivitySchema = z.object({
  bookingId: z.uuid(),
  action: z.enum(RentalAction),
});

export type CreateRentalActivityDto = z.infer<typeof RentalActivitySchema>;
