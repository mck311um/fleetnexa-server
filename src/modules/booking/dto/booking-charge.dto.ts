import { IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateBookingChargeDto {
  @IsString()
  rentalId: string;

  @IsNumber()
  amount: number;

  @IsString()
  charge: string;

  @IsUUID()
  customerId: string;

  @IsString()
  reason: string;
}
