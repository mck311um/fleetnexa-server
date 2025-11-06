import { z } from 'zod';

export const VehicleBrandSchema = z.object({
  id: z.uuid().optional(),
  brand: z.string().min(1).max(100),
});

export type VehicleBrandDto = z.infer<typeof VehicleBrandSchema>;
