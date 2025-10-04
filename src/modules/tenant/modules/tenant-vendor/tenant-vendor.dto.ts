import { z } from 'zod';

export const TenantVendorSchema = z.object({
  id: z.uuid(),
  vendor: z.string().min(1, 'Vendor name is required'),
  contactName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
});

export type TenantVendorDto = z.infer<typeof TenantVendorSchema>;
