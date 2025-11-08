import { z } from 'zod';

export const TenantViolationSchema = z.object({
  id: z.uuid(),
  violation: z.string().min(2).max(100),
  description: z.string().optional(),
  amount: z.number().min(0, { message: 'Amount is required' }),
});

export type TenantViolationDto = z.infer<typeof TenantViolationSchema>;

const TenantAddressSchema = z.object({
  street: z.string().min(2).max(100),
  villageId: z.uuid(),
  stateId: z.uuid(),
  countryId: z.uuid(),
});

const CancellationPolicySchema = z.object({
  amount: z.number().min(0).optional(),
  policy: z.string().max(100).optional(),
  minimumDays: z.number().min(0).optional(),
  bookingMinimumDays: z.number().min(0).optional(),
});

const LatePolicySchema = z.object({
  amount: z.number().min(0).optional(),
  maxHours: z.number().min(0).optional(),
});

export const UpdateTenantDtoSchema = z.object({
  tenantName: z.string().min(2).max(100),
  email: z.email(),
  number: z.string().min(7).max(15),
  logo: z.url().optional().nullable(),
  address: TenantAddressSchema,
  website: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
  paymentMethods: z.array(z.string()).min(1),
  financialYearStart: z.string(),
  currencyId: z.uuid(),
  invoiceSequenceId: z.uuid(),
  payableTo: z.string().max(100).optional().nullable(),
  invoiceFootNotes: z.string().max(500).optional(),
  fromUSDRate: z.number().min(0).optional().nullable(),
  securityDeposit: z.float64().min(0),
  additionalDriverFee: z.float64().min(0),
  daysInMonth: z.number().min(0),
  cancellationPolicy: CancellationPolicySchema,
  latePolicy: LatePolicySchema,
});

export type UpdateTenantDto = z.infer<typeof UpdateTenantDtoSchema>;

export const StorefrontSettingsDtoSchema = z
  .object({
    storefrontEnabled: z.boolean(),
    description: z.string().max(500).optional().nullable(),
  })
  .refine(
    (data) =>
      !data.storefrontEnabled ||
      (data.description !== null &&
        data.description !== undefined &&
        data.description.trim().length > 0),
    {
      message: 'Description is required when storefront is enabled',
      path: ['description'],
    },
  );

export type StorefrontSettingsDto = z.infer<typeof StorefrontSettingsDtoSchema>;
