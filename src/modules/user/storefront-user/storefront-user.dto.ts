import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class StorefrontUserDto {
  @IsUUID()
  id: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  licenseNumber: string;

  @IsString()
  licenseExpiry: string;

  @IsString()
  licenseIssued: string;

  @IsString()
  dateOfBirth: string;

  @IsString()
  @IsOptional()
  license?: string;

  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  villageId?: string;

  @IsString()
  @IsOptional()
  stateId?: string;

  @IsString()
  @IsOptional()
  countryId?: string;
}
