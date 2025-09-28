import { z } from 'zod';

export const UpdateVehicleStatusSchema = z.object({
  vehicleId: z.uuid(),
  status: z.uuid(),
});

export type UpdateVehicleStatusDto = z.infer<typeof UpdateVehicleStatusSchema>;

export const VehicleSchema = z.object({
  id: z.uuid(),
  color: z.string(),
  engineVolume: z.number(),
  featuredImage: z.string(),
  features: z.array(z.uuid()).nullable(),
  fuelLevel: z.number(),
  images: z.array(z.string()).nullable(),
  licensePlate: z.string(),
  brandId: z.uuid(),
  modelId: z.uuid(),
  numberOfSeats: z.number(),
  numberOfDoors: z.number(),
  tankVolume: z.number().nullable(),
  odometer: z.number().nullable(),
  steering: z.string(),
  vin: z.string().nullable(),
  year: z
    .number()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  transmissionId: z.uuid(),
  vehicleStatusId: z.uuid(),
  wheelDriveId: z.uuid(),
  fuelTypeId: z.uuid(),
  dayPrice: z.number(),
  weekPrice: z.number(),
  monthPrice: z.number(),
  timeBetweenRentals: z.number(),
  minimumAge: z.number(),
  minimumRental: z.number(),
  fuelPolicyId: z.uuid(),
  locationId: z.uuid(),
  drivingExperience: z.number(),
  refundAmount: z.number().nullable(),
});

export type VehicleDto = z.infer<typeof VehicleSchema>;
