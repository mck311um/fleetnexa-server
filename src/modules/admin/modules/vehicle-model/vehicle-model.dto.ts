import { z } from 'zod';

export const VehicleModelSchema = z.object({
  id: z.uuid().optional(),
  model: z.string().min(1).max(100),
  brand: z.string().min(1).max(100),
  bodyType: z.string().min(1).max(100),
});

export type VehicleModelDto = z.infer<typeof VehicleModelSchema>;
