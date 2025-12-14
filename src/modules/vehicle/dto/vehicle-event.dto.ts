import { IsEnum, IsString, IsUUID } from 'class-validator';
import { VehicleEventType } from '../../../generated/prisma/client.js';

export class VehicleEventDto {
  @IsUUID()
  vehicleId: string;

  @IsString()
  event: string;

  @IsEnum(VehicleEventType)
  type: VehicleEventType;

  @IsString()
  date: string;

  @IsString()
  notes?: string;
}
