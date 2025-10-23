import { DamageLocation, Severity } from '@prisma/client';
import { z } from 'zod';

export const VehicleDamageSchema = z.object({
  id: z.uuid(),
  vehicleId: z.uuid(),
  description: z.string().max(500).optional(),
  images: z.array(z.string()).optional(),
  isRepaired: z.boolean().default(false),
  partId: z.string().max(100),
  location: z.enum(DamageLocation),
  customerId: z.string().optional(),
  title: z.string().min(2).max(100),
  severity: z.enum(Severity),
});

export type VehicleDamageDto = z.infer<typeof VehicleDamageSchema>;
