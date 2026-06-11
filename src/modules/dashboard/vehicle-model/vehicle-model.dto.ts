import { IsString } from 'class-validator';

export class CreateVehicleModelDto {
  @IsString()
  model: string;

  @IsString()
  brand: string;

  @IsString()
  bodyType: string;
}

export class UpdateVehicleModelDto extends CreateVehicleModelDto {
  @IsString()
  id: string;
}
