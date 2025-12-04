import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PricePolicy } from './../../../generated/prisma/enums.js';

export class TenantExtraDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsEnum(['service', 'equipment', 'insurance'])
  @IsNotEmpty()
  type: 'service' | 'equipment' | 'insurance';

  @IsString()
  @IsNotEmpty()
  item: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  pricePolicy: PricePolicy;

  @IsNumber()
  @IsNotEmpty()
  price: number;
}
