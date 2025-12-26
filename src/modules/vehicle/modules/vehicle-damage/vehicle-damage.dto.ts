import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
} from 'class-validator';
import {
  DamageLocation,
  Severity,
} from '../../../../generated/prisma/enums.js';

export class VehicleDamageDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsUUID()
  @IsNotEmpty()
  vehicleId: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsBoolean()
  @IsOptional()
  isRepaired: boolean = false;

  @IsString()
  @IsNotEmpty()
  partId: string;

  @IsEnum(DamageLocation)
  @IsNotEmpty()
  location: DamageLocation;

  @IsUUID()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(Severity)
  @IsNotEmpty()
  severity: Severity;
}
