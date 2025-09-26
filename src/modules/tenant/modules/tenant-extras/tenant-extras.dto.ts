import { PricePolicy } from '@prisma/client';
import { z } from 'zod';

export const TenantExtraSchema = z.object({
  id: z.uuid(),
  type: z.enum(['insurance', 'equipment', 'service']),
  item: z.string().min(1, 'Item is required'),
  description: z.string().optional(),
  pricePolicy: z.enum(PricePolicy),
  price: z.number().min(0, 'Price must be at least 0'),
});

export type TenantExtraDto = z.infer<typeof TenantExtraSchema>;
