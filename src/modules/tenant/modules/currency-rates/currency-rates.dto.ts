import { z } from 'zod';

export const CurrencyRateSchema = z.object({
  id: z.uuid(),
  fromRate: z.number().min(0),
  toRate: z.number().min(0),
  enabled: z.boolean(),
  currencyId: z.uuid(),
});

export type CurrencyRateDto = z.infer<typeof CurrencyRateSchema>;
