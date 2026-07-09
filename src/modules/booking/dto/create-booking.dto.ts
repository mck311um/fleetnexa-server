import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Agent } from '../../../generated/prisma/enums.js';
import { Type } from 'class-transformer';
import {
  BookingDriverDto,
  BookingValuesDto,
  SecurityDepositDto,
} from '../dto/booking-items.dto.js';

export class CreateBookingDto {
  @IsUUID()
  id: string;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsUUID()
  pickupLocationId: string;

  @IsUUID()
  returnLocationId: string;

  @IsUUID()
  vehicleId: string;

  @IsUUID()
  chargeTypeId: string;

  @IsEnum(Agent)
  agent: Agent;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BookingDriverDto)
  drivers: BookingDriverDto[];

  @IsObject()
  values: BookingValuesDto;

  @IsObject()
  @Type(() => SecurityDepositDto)
  securityDeposit: SecurityDepositDto;
}
