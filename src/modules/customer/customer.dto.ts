import { CustomerStatus } from '@prisma/client';
import z, { date } from 'zod';

export const CustomerDriverLicenseSchema = z.object({
  id: z.uuid(),
  customerId: z.uuid(),
  licenseNumber: z.string(),
  licenseIssued: z.string(),
  licenseExpiry: z.string(),
  image: z.string().optional(),
});

export const CustomerAddressSchema = z.object({
  street: z.string().optional(),
  villageId: z.string().optional(),
  stateId: z.string().optional(),
  countryId: z.string().optional(),
});

export const CustomerSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  gender: z.string().optional(),
  dateOfBirth: z.string(),
  phone: z.string().optional(),
  profileImage: z.string().optional(),
  status: z.enum(CustomerStatus),
  driversLicense: CustomerDriverLicenseSchema,
  address: CustomerAddressSchema,
});

export type CustomerDto = z.infer<typeof CustomerSchema>;
