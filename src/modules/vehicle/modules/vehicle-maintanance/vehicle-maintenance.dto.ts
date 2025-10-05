import { DamageLocation, MaintenanceStatus, Severity } from '@prisma/client';
import { z } from 'zod';

export const VehicleMaintenanceSchema = z.object({
  id: z.uuid(),
  vehicleId: z.uuid(),
  serviceId: z.uuid(),
  vendorId: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  cost: z.number().min(0),
  status: z.enum(MaintenanceStatus).optional(),
});

export type VehicleMaintenanceDto = z.infer<typeof VehicleMaintenanceSchema>;
