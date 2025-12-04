import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from 'class-validator';

export class TenantLocationDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsBoolean()
  @IsNotEmpty()
  pickupEnabled: boolean;

  @IsBoolean()
  @IsNotEmpty()
  returnEnabled: boolean;

  @IsBoolean()
  @IsNotEmpty()
  storefrontEnabled: boolean;

  @IsNumber()
  @IsNotEmpty()
  deliveryFee: number;

  @IsNumber()
  @IsNotEmpty()
  collectionFee: number;

  @IsNumber()
  @IsNotEmpty()
  minimumRentalPeriod: number;
}
