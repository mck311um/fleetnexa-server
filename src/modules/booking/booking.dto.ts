import { z } from 'zod';

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

export const StorefrontUserBookingSchema = z.object({
  userId: z.uuid(),
  startDate: z.string(),
  endDate: z.string(),
  pickupLocationId: z.uuid(),
  returnLocationId: z.uuid(),
  vehicleId: z.uuid(),
  tenantId: z.uuid(),
  values: RentalValuesSchema,
});

export type StorefrontUserBookingDto = z.infer<
  typeof StorefrontUserBookingSchema
>;

export const StorefrontCustomerSchema = z.object({
  firstName: z.string().max(100),
  lastName: z.string().max(100),
  email: z.email().max(255),
  gender: z.string().optional(),
  phone: z.string().max(20),
  driverLicenseNumber: z.string().max(50),
  licenseExpiry: z.string().max(50),
  licenseIssued: z.string().max(50),
  dateOfBirth: z.string(),
  license: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    villageId: z.string().optional(),
    stateId: z.string().optional(),
    countryId: z.string().optional(),
  }),
});

export type StorefrontCustomerDto = z.infer<typeof StorefrontCustomerSchema>;

export const StorefrontGuestBookingSchema = z.object({
  customer: StorefrontCustomerSchema,
  startDate: z.string(),
  endDate: z.string(),
  pickupLocationId: z.uuid(),
  returnLocationId: z.uuid(),
  vehicleId: z.uuid(),
  tenantId: z.uuid(),
  values: RentalValuesSchema,
});

export type StorefrontGuestBookingDto = z.infer<
  typeof StorefrontGuestBookingSchema
>;
