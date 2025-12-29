import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class VillageDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  village: string;

  @IsUUID()
  @IsOptional()
  stateId?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsUUID()
  @IsOptional()
  countryId?: string;

  @IsString()
  @IsOptional()
  country?: string;
}
