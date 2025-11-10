import { z } from 'zod';

export const BodyTypeSchema = z.object({
  id: z.uuid().optional(),
  bodyType: z.string().min(1).max(100),
});

export type BodyTypeDto = z.infer<typeof BodyTypeSchema>;
