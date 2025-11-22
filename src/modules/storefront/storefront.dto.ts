import { email, z } from 'zod';

export const StorefrontRatingSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid().optional(),
  fullName: z.string().max(200),
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
  email: z.email().max(255),
});

export type StorefrontRatingDto = z.infer<typeof StorefrontRatingSchema>;
