import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CountryDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}
