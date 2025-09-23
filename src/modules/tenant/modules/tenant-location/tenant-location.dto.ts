import { z } from 'zod';

export const TenantLocationSchema = z.object({
  id: z.uuid(),
  location: z.string().min(2).max(100),
  pickupEnabled: z.boolean(),
  returnEnabled: z.boolean(),
  storefrontEnabled: z.boolean(),
  deliveryFee: z.number().min(0).optional(),
  collectionFee: z.number().min(0).optional(),
  minimumRentalPeriod: z.number().min(0).optional(),
});

export type TenantLocationDto = z.infer<typeof TenantLocationSchema>;
