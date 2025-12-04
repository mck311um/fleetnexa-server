import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class TenantViolationDto {
  @IsUUID()
  id: string;

  @IsString()
  violation: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  amount: number;
}
