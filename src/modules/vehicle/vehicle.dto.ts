import { z } from 'zod';

export const UpdateVehicleStatusSchema = z.object({
  vehicleId: z.uuid(),
  status: z.uuid(),
});

export type UpdateVehicleStatusDto = z.infer<typeof UpdateVehicleStatusSchema>;
