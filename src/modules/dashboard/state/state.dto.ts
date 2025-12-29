import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class StateDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsUUID()
  @IsOptional()
  countryId?: string;

  @IsString()
  @IsOptional()
  country?: string;
}
