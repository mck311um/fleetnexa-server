import { IsNotEmpty, IsUUID } from 'class-validator';

export class VehicleStatusDto {
  @IsUUID()
  @IsNotEmpty()
  vehicleId: string;

  @IsUUID()
  @IsNotEmpty()
  status: string;
}
