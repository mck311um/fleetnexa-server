import { z } from 'zod';

import { Agent } from '@prisma/client';

const RentalDriverSchema = z.object({
  id: z.uuid(),
  driverId: z.uuid(),
  isPrimary: z.boolean().default(false),
});

const RentalExtrasSchema = z.array(
  z.object({
    id: z.uuid(),
    extraId: z.uuid(),
    amount: z.float64().min(0),
    customAmount: z.boolean().default(false),
    valuesId: z.uuid(),
  }),
);

const RentalValuesSchema = z.object({
  id: z.uuid(),
  numberOfDays: z.number().min(1),
  basePrice: z.float64().min(0),
  customBasePrice: z.boolean().default(false),
  totalCost: z.float64().min(0),
  customTotalCost: z.boolean().default(false),
  discount: z.float64().min(0),
  customDiscount: z.boolean().default(false),
  deliveryFee: z.float64().min(0),
  customDeliveryFee: z.boolean().default(false),
  collectionFee: z.float64().min(0),
  customCollectionFee: z.boolean().default(false),
  deposit: z.float64().min(0),
  customDeposit: z.boolean().default(false),
  totalExtras: z.float64().min(0),
  subTotal: z.float64().min(0),
  netTotal: z.float64().min(0),
  discountAmount: z.float64().min(0),
  discountPolicy: z.string().max(500).optional(),
  additionalDriverFees: z.float64().min(0),
  extras: RentalExtrasSchema,
});

export const CreateBookingDtoSchema = z.object({
  id: z.uuid(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid startDate',
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid endDate',
  }),
  pickupLocationId: z.uuid(),
  returnLocationId: z.uuid(),
  vehicleId: z.uuid(),
  chargeTypeId: z.uuid(),
  agent: z.enum(Agent).optional(),
  notes: z.string().max(500).optional(),
  drivers: z.array(RentalDriverSchema).min(1),
  values: RentalValuesSchema,
});

export type CreateBookingDto = z.infer<typeof CreateBookingDtoSchema>;
