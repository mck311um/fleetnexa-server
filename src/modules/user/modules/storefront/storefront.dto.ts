import { email, z } from 'zod';

export const StorefrontUserSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: email().max(100),
  gender: z.string().optional(),
  phone: z.string().optional(),
  driversLicenseNumber: z.string().min(5),
  licenseExpiry: z.string(),
  licenseIssued: z.string(),
  license: z.string().optional(),
  dateOfBirth: z.string().optional(),
  street: z.string().optional(),
  villageId: z.string().optional(),
  countryId: z.string().optional(),
  stateId: z.string().optional(),
});

export type StorefrontUserDto = z.infer<typeof StorefrontUserSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
});

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
